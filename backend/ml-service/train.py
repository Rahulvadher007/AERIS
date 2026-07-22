import os
import json
import joblib
import pandas as pd
import numpy as np
import optuna
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from dataset_builder import build_dataset
from feature_engineering import engineer_features

FEATURE_COLS = [
    'hour', 'day', 'month', 'dayOfWeek', 'temperature', 'humidity',
    'windSpeed', 'windDirection', 'pressure', 'rainfall',
    'congestionScore', 'vehicleCount', 'aqi', 'pm25', 'pm10',
    'aqi_1h', 'aqi_3h', 'aqi_6h', 'aqi_12h', 'aqi_24h',
    'rollingAvg24h', 'rollingAvg72h', 'rollingMax24h', 'rollingMin24h'
]

# Features with consistently low importance (from feature_importance.json analysis)
LOW_IMPORTANCE_FEATURES = ['windDirection', 'rainfall', 'pm10']
SELECTED_FEATURES = [f for f in FEATURE_COLS if f not in LOW_IMPORTANCE_FEATURES]


def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100


def objective(trial, X, y):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 1000, step=50),
        'max_depth': trial.suggest_int('max_depth', 3, 12),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
        'gamma': trial.suggest_float('gamma', 0, 5),
        'random_state': 42,
        'early_stopping_rounds': 50,
    }

    tscv = TimeSeriesSplit(n_splits=5)
    rmse_scores = []

    for train_idx, val_idx in tscv.split(X):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model = XGBRegressor(**params, eval_metric='rmse')
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

        y_pred = model.predict(X_val)
        rmse = np.sqrt(mean_squared_error(y_val, y_pred))
        rmse_scores.append(rmse)

    return np.mean(rmse_scores)


def train_pipeline():
    print("Starting ML Pipeline with Optuna tuning...")
    dataset_path = build_dataset()
    df = pd.read_csv(dataset_path)
    df = engineer_features(df)

    horizons = ['24h', '48h', '72h']
    targets = ['aqi', 'pm25', 'pm10']

    os.makedirs('model', exist_ok=True)
    metrics = {}
    feature_importances = {}
    best_params = {}

    for horizon in horizons:
        print(f"\n=== Horizon: {horizon} ===")
        metrics[horizon] = {}
        best_params[horizon] = {}

        for target in targets:
            target_col = f'target_{target}_{horizon}'
            print(f"\nTuning model for {target.upper()} - {horizon}...")

            X = df[SELECTED_FEATURES]
            y = df[target_col]

            # Temporal train/test split
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
            y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

            # Optuna hyperparameter search
            study = optuna.create_study(direction='minimize', sampler=optuna.samplers.TPESampler(seed=42))
            study.optimize(lambda trial: objective(trial, X_train, y_train), n_trials=50, show_progress_bar=True)

            best_params[horizon][target] = study.best_params
            print(f"Best params: {study.best_params}")
            print(f"Best CV RMSE: {study.best_value:.4f}")

            # Train final model with best params on full training set
            final_params = {k: v for k, v in study.best_params.items() if k != 'early_stopping_rounds'}
            final_params['random_state'] = 42

            model = XGBRegressor(**final_params, eval_metric='rmse')
            model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

            # Evaluate
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            mape = mean_absolute_percentage_error(y_test, y_pred)

            metrics[horizon][target] = {
                'MAE': float(mae),
                'RMSE': float(rmse),
                'R2': float(r2),
                'MAPE': float(mape),
                'CV_RMSE': float(study.best_value),
            }

            # Save model
            model_path = f'model/model_{target}_{horizon}.pkl'
            joblib.dump(model, model_path)
            print(f"Saved {model_path} — R²: {r2:.4f}, RMSE: {rmse:.4f}, MAPE: {mape:.2f}%")

            # Feature importance
            if target == 'aqi':
                importance = dict(zip(SELECTED_FEATURES, map(float, model.feature_importances_)))
                importance = dict(sorted(importance.items(), key=lambda item: item[1], reverse=True))
                feature_importances[horizon] = importance

    with open('model/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)
    with open('model/feature_importance.json', 'w') as f:
        json.dump(feature_importances, f, indent=4)
    with open('model/best_params.json', 'w') as f:
        json.dump(best_params, f, indent=4)

    print("\nTraining Pipeline Completed Successfully.")


if __name__ == '__main__':
    train_pipeline()
