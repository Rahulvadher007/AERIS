import os
import json
import joblib
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

from dataset_builder import build_dataset
from feature_engineering import engineer_features

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    # Avoid division by zero
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

def train_pipeline():
    print("Starting ML Pipeline...")
    dataset_path = build_dataset()
    df = pd.read_csv(dataset_path)
    df = engineer_features(df)
    
    # Define feature columns
    features = [
        'hour', 'day', 'month', 'dayOfWeek', 'temperature', 'humidity', 
        'windSpeed', 'windDirection', 'pressure', 'rainfall', 
        'congestionScore', 'vehicleCount', 'aqi', 'pm25', 'pm10',
        'aqi_1h', 'aqi_3h', 'aqi_6h', 'aqi_12h', 'aqi_24h', 
        'rollingAvg24h', 'rollingAvg72h', 'rollingMax24h', 'rollingMin24h'
    ]

    horizons = ['24h', '48h', '72h']
    targets = ['aqi', 'pm25', 'pm10']
    
    os.makedirs('model', exist_ok=True)
    metrics = {}
    feature_importances = {}

    for horizon in horizons:
        metrics[horizon] = {}
        for target in targets:
            target_col = f'target_{target}_{horizon}'
            print(f"Training Model for {target.upper()} - {horizon}...")
            
            X = df[features]
            y = df[target_col]
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
            
            # Initialize XGBoost Regressor
            model = XGBRegressor(
                n_estimators=100, 
                max_depth=6, 
                learning_rate=0.1, 
                subsample=0.8, 
                colsample_bytree=0.8,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            
            # Predict and evaluate
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            mape = mean_absolute_percentage_error(y_test, y_pred)
            
            metrics[horizon][target] = {
                'MAE': float(mae),
                'RMSE': float(rmse),
                'R2': float(r2),
                'MAPE': float(mape)
            }
            
            # Save Model
            model_path = f'model/model_{target}_{horizon}.pkl'
            joblib.dump(model, model_path)
            
            # Extract Feature Importance (we only need one per horizon, they are largely similar, but let's save the AQI one)
            if target == 'aqi':
                importance = dict(zip(features, map(float, model.feature_importances_)))
                # Sort by importance
                importance = dict(sorted(importance.items(), key=lambda item: item[1], reverse=True))
                feature_importances[horizon] = importance

    with open('model/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
        
    with open('model/feature_importance.json', 'w') as f:
        json.dump(feature_importances, f, indent=4)

    print("Training Pipeline Completed Successfully.")

if __name__ == '__main__':
    train_pipeline()
