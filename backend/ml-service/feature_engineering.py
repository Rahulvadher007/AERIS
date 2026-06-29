import pandas as pd
import numpy as np

def engineer_features(df):
    print("Engineering temporal features...")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day'] = df['timestamp'].dt.day
    df['month'] = df['timestamp'].dt.month
    df['dayOfWeek'] = df['timestamp'].dt.dayofweek
    
    # Sort to ensure lag logic is correct
    df = df.sort_values(by=['stationId', 'timestamp'])

    print("Engineering lag features...")
    df['aqi_1h'] = df.groupby('stationId')['aqi'].shift(1)
    df['aqi_3h'] = df.groupby('stationId')['aqi'].shift(3)
    df['aqi_6h'] = df.groupby('stationId')['aqi'].shift(6)
    df['aqi_12h'] = df.groupby('stationId')['aqi'].shift(12)
    df['aqi_24h'] = df.groupby('stationId')['aqi'].shift(24)
    
    print("Engineering rolling features...")
    df['rollingAvg24h'] = df.groupby('stationId')['aqi'].rolling(window=24, min_periods=1).mean().reset_index(level=0, drop=True)
    df['rollingAvg72h'] = df.groupby('stationId')['aqi'].rolling(window=72, min_periods=1).mean().reset_index(level=0, drop=True)
    df['rollingMax24h'] = df.groupby('stationId')['aqi'].rolling(window=24, min_periods=1).max().reset_index(level=0, drop=True)
    df['rollingMin24h'] = df.groupby('stationId')['aqi'].rolling(window=24, min_periods=1).min().reset_index(level=0, drop=True)

    # Shift targets (Predicting FUTURE values based on CURRENT features)
    df['target_aqi_24h'] = df.groupby('stationId')['aqi'].shift(-24)
    df['target_pm25_24h'] = df.groupby('stationId')['pm25'].shift(-24)
    df['target_pm10_24h'] = df.groupby('stationId')['pm10'].shift(-24)

    df['target_aqi_48h'] = df.groupby('stationId')['aqi'].shift(-48)
    df['target_pm25_48h'] = df.groupby('stationId')['pm25'].shift(-48)
    df['target_pm10_48h'] = df.groupby('stationId')['pm10'].shift(-48)

    df['target_aqi_72h'] = df.groupby('stationId')['aqi'].shift(-72)
    df['target_pm25_72h'] = df.groupby('stationId')['pm25'].shift(-72)
    df['target_pm10_72h'] = df.groupby('stationId')['pm10'].shift(-72)

    # Drop rows where target is NaN (we can't train on them)
    df = df.dropna()

    return df
