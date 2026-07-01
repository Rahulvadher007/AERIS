import os
import joblib
import pandas as pd
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from train import train_pipeline

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
    path = f"model/model_{target}_{horizon}.pkl"
    if not os.path.exists(path):
        raise HTTPException(status_code=503, detail=f"Model {path} not trained yet.")
    return joblib.load(path)

# Approximate sub-index conversion to standard AQI scale
# Real formula uses breakpoints, but here we do a direct proxy mapping for demonstration
def pm25_to_aqi(pm25: float) -> float:
    return pm25 * 2.5 # Proxy estimate
    
def pm10_to_aqi(pm10: float) -> float:
    return pm10 * 1.5 # Proxy estimate

def compute_aqi_from_pollutants(aqi_pred, pm25_pred, pm10_pred):
    # Determine future AQI from pollutant predictions
    derived_pm25_aqi = pm25_to_aqi(pm25_pred)
    derived_pm10_aqi = pm10_to_aqi(pm10_pred)
    
    # Final AQI is technically the maximum of the sub-indices. 
    # We blend the direct AQI model prediction with the pollutant sub-indexes.
    final_aqi = max(aqi_pred, derived_pm25_aqi, derived_pm10_aqi)
    return float(final_aqi)

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
    
    final_aqi = compute_aqi_from_pollutants(aqi_pred, pm25_pred, pm10_pred)
    
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
        "confidence": 0.85, # In a real scenario, this would use prediction intervals or variance
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
