import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from train import train_pipeline
from cachetools import TTLCache
import logging

logger = logging.getLogger(__name__)

MODELS: dict[str, dict[str, object]] = {}
prediction_cache = TTLCache(maxsize=2048, ttl=3600)

app = FastAPI(title="Urban AI - ML Forecasting API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the backend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    features: Dict[str, float]

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

@app.post("/predict/{horizon}")
async def predict(horizon: str, req: PredictRequest):
    if horizon not in ['24h', '48h', '72h']:
        raise HTTPException(status_code=400, detail="Horizon must be 24h, 48h, or 72h")
    
    return predict_horizon(horizon, req.features)

@app.post("/ml/train")
async def train(background_tasks: BackgroundTasks):
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
