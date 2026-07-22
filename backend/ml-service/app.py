import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import psycopg2
import psycopg2.extras
from train import train_pipeline
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

MODELS: dict[str, dict[str, object]] = {}
prediction_cache = TTLCache(maxsize=2048, ttl=3600)

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3001").split(",")

app = FastAPI(title="Urban AI - ML Forecasting API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class PredictRequest(BaseModel):
    features: Dict[str, float]

class BatchPredictRequest(BaseModel):
    stations: List[str]

def get_db_connection():
    DATABASE_URL = os.getenv('DATABASE_URL')
    if not DATABASE_URL:
        raise HTTPException(status_code=503, detail="DATABASE_URL not configured")
    return psycopg2.connect(DATABASE_URL)

def get_model(target: str, horizon: str):
    model = MODELS.get(target, {}).get(horizon)
    if model is None:
        raise HTTPException(status_code=503, detail=f"Model {target}_{horizon} not loaded.")
    return model

@app.on_event("startup")
async def load_models():
    targets = ['aqi', 'pm25', 'pm10']
    horizons = ['24h', '48h', '72h']
    for target in targets:
        MODELS[target] = {}
        for horizon in horizons:
            path = f"model/model_{target}_{horizon}.pkl"
            if os.path.exists(path):
                MODELS[target][horizon] = joblib.load(path)
                logger.info(f"Loaded {path}")
            else:
                logger.warning(f"Model not found: {path}")
                MODELS[target][horizon] = None
    logger.info(f"Loaded {sum(len(v) for v in MODELS.values())} models")

# EPA/CPCB breakpoint tables for AQI computation
PM25_BREAKPOINTS = [
    (0.0, 30.0, 0, 50),
    (30.1, 60.0, 51, 100),
    (60.1, 90.0, 101, 200),
    (90.1, 120.0, 201, 300),
    (120.1, 250.0, 301, 400),
    (250.1, float('inf'), 401, 500),
]

PM10_BREAKPOINTS = [
    (0.0, 50.0, 0, 50),
    (50.1, 100.0, 51, 100),
    (100.1, 250.0, 101, 200),
    (250.1, 350.0, 201, 300),
    (350.1, 430.0, 301, 400),
    (430.1, float('inf'), 401, 500),
]


def concentration_to_aqi(concentration: float, breakpoints: list) -> float:
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= concentration <= c_high:
            return ((i_high - i_low) / (c_high - c_low)) * (concentration - c_low) + i_low
    return i_high


def aqi_from_pollutants(pm25: float, pm10: float) -> float:
    sub_indices = [
        concentration_to_aqi(pm25, PM25_BREAKPOINTS),
        concentration_to_aqi(pm10, PM10_BREAKPOINTS),
    ]
    return float(max(sub_indices))


# Load validation RMSE from training metrics for confidence computation
try:
    with open('model/metrics.json') as f:
        _METRICS = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    _METRICS = {}

FEATURE_COLS = [
    'hour', 'day', 'month', 'dayOfWeek', 'temperature', 'humidity',
    'windSpeed', 'windDirection', 'pressure', 'rainfall',
    'congestionScore', 'vehicleCount', 'aqi', 'pm25', 'pm10',
    'aqi_1h', 'aqi_3h', 'aqi_6h', 'aqi_12h', 'aqi_24h',
    'rollingAvg24h', 'rollingAvg72h', 'rollingMax24h', 'rollingMin24h'
]


def build_station_features(conn, station_code: str) -> dict | None:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
            WITH latest_aqi AS (
                SELECT timestamp, aqi, pm25, pm10
                FROM aqi_readings ar
                JOIN stations s ON s.id = ar."stationId"
                WHERE s."stationCode" = %s
                ORDER BY ar.timestamp DESC
                LIMIT 25
            ),
            weather AS (
                SELECT temperature, humidity, "windSpeed", "windDirection", pressure, rainfall
                FROM weather_data wd
                JOIN stations s ON s.id = wd."stationId"
                WHERE s."stationCode" = %s
                ORDER BY wd.timestamp DESC
                LIMIT 1
            ),
            traffic AS (
                SELECT AVG(t."congestionScore") as congestionscore,
                       SUM(t."vehicleCount") as vehiclecount
                FROM traffic_data t
                WHERE t.timestamp >= COALESCE((SELECT MAX(timestamp) FROM latest_aqi), NOW() - INTERVAL '1 hour')
            )
            SELECT * FROM (SELECT * FROM latest_aqi LIMIT 1) la, weather, traffic
        """, (station_code, station_code))

        row = cur.fetchone()

    if row is None or row.get('aqi') is None:
        return None

    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT aqi FROM aqi_readings ar
            JOIN stations s ON s.id = ar."stationId"
            WHERE s."stationCode" = %s
            ORDER BY ar.timestamp DESC
            LIMIT 25
        """, (station_code,))
        aqi_rows = cur.fetchall()

    ts = row['timestamp']
    aqi_series = [r['aqi'] for r in reversed(aqi_rows)]

    def safe_get(arr, idx):
        return arr[-(idx + 1)] if len(arr) > idx + 1 else arr[0] if arr else 0.0

    features = {
        'hour': ts.hour,
        'day': ts.day,
        'month': ts.month,
        'dayOfWeek': ts.weekday(),
        'temperature': float(row['temperature'] or 0),
        'humidity': float(row['humidity'] or 0),
        'windSpeed': float(row['windSpeed'] or 0),
        'windDirection': float(row['windDirection'] or 0),
        'pressure': float(row['pressure'] or 0),
        'rainfall': float(row['rainfall'] or 0),
        'congestionScore': float(row['congestionscore'] or 0),
        'vehicleCount': float(row['vehiclecount'] or 0),
        'aqi': float(row['aqi'] or 0),
        'pm25': float(row['pm25'] or 0),
        'pm10': float(row['pm10'] or 0),
        'aqi_1h': safe_get(aqi_series, 1),
        'aqi_3h': safe_get(aqi_series, 3),
        'aqi_6h': safe_get(aqi_series, 6),
        'aqi_12h': safe_get(aqi_series, 12),
        'aqi_24h': safe_get(aqi_series, 24),
        'rollingAvg24h': float(pd.Series(aqi_series[-24:]).mean()) if len(aqi_series) >= 24 else float(pd.Series(aqi_series).mean()),
        'rollingAvg72h': float(pd.Series(aqi_series).mean()),
        'rollingMax24h': float(pd.Series(aqi_series[-24:]).max()) if len(aqi_series) >= 24 else float(pd.Series(aqi_series).max()),
        'rollingMin24h': float(pd.Series(aqi_series[-24:]).min()) if len(aqi_series) >= 24 else float(pd.Series(aqi_series).min()),
    }
    return features


def predict_horizon(horizon: str, features: Dict[str, float]):
    df = pd.DataFrame([features])
    
    # Ensure columns match training
    feature_cols = [
        'hour', 'day', 'month', 'dayOfWeek', 'temperature', 'humidity', 
        'windSpeed', 'windDirection', 'pressure', 'rainfall', 
        'congestionScore', 'vehicleCount', 'aqi', 'pm25', 'pm10',
        'aqi_1h', 'aqi_3h', 'aqi_6h', 'aqi_12h', 'aqi_24h', 
        'rollingAvg24h', 'rollingAvg72h', 'rollingMax24h', 'rollingMin24h'
    ]
    
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0.0 # Default missing features
            
    X = df[feature_cols]
    
    model_aqi = get_model('aqi', horizon)
    model_pm25 = get_model('pm25', horizon)
    model_pm10 = get_model('pm10', horizon)
    
    aqi_pred = model_aqi.predict(X)[0]
    pm25_pred = model_pm25.predict(X)[0]
    pm10_pred = model_pm10.predict(X)[0]
    
    final_aqi = aqi_from_pollutants(pm25_pred, pm10_pred)
    
    # Derive confidence from validation RMSE instead of hardcoded 0.85
    rmse = _METRICS.get(horizon, {}).get('aqi', {}).get('RMSE', final_aqi * 0.2)
    confidence = max(0.5, min(0.98, 1.0 - (rmse / (final_aqi + 1))))
    
    # Categorize
    category = "Good"
    risk_level = "Low Risk"
    if final_aqi > 300:
        category = "Hazardous"
        risk_level = "Extreme Risk"
    elif final_aqi > 200:
        category = "Very Poor"
        risk_level = "High Risk"
    elif final_aqi > 100:
        category = "Moderate"
        risk_level = "Medium Risk"
        
    return {
        "forecastAQI": round(final_aqi, 2),
        "forecastPM25": round(float(pm25_pred), 2),
        "forecastPM10": round(float(pm10_pred), 2),
        "confidence": round(confidence, 4),
        "category": category,
        "riskLevel": risk_level
    }

@app.post("/predict/batch")
async def predict_batch(req: BatchPredictRequest, horizon: str = "24h"):
    if horizon not in ['24h', '48h', '72h']:
        raise HTTPException(status_code=400, detail="Horizon must be 24h, 48h, or 72h")

    results = []
    conn = get_db_connection()
    try:
        for station_code in req.stations:
            cache_key = f"{station_code}_{horizon}"
            cached = prediction_cache.get(cache_key)
            if cached:
                results.append(cached)
                continue

            features = build_station_features(conn, station_code)
            if features is None:
                results.append({"stationCode": station_code, "error": "No data"})
                continue

            result = predict_horizon(horizon, features)
            conf_lower = max(0, result["forecastAQI"] * (1 - result["confidence"]))
            conf_upper = result["forecastAQI"] * (1 + result["confidence"])
            result["confidence_lower"] = round(conf_lower, 2)
            result["confidence_upper"] = round(conf_upper, 2)
            result["stationCode"] = station_code
            prediction_cache[cache_key] = result
            results.append(result)
    finally:
        conn.close()

    return {"results": results}

@app.post("/predict/{horizon}")
async def predict(horizon: str, req: PredictRequest):
    if horizon not in ['24h', '48h', '72h']:
        raise HTTPException(status_code=400, detail="Horizon must be 24h, 48h, or 72h")
    
    return predict_horizon(horizon, req.features)

@app.post("/ml/train")
async def train(background_tasks: BackgroundTasks):
    prediction_cache.clear()
    background_tasks.add_task(train_pipeline)
    return {"message": "Training pipeline started in the background."}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AERIS ML Service", "environment": os.getenv("ENVIRONMENT", "production")}

@app.get("/model-info")
async def model_info():
    return {
        "models_available": ["aqi", "pm25", "pm10"],
        "horizons_supported": ["24h", "48h", "72h"],
        "algorithm": "XGBoostRegressor",
        "version": "1.0"
    }
