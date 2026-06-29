import pandas as pd
from feature_engineering import engineer_features

def test_feature_engineering_columns():
    data = {
        'stationId': ['A'] * 100,
        'timestamp': pd.date_range(start='2024-01-01', periods=100, freq='h'),
        'aqi': range(100),
        'pm25': range(100),
        'pm10': range(100)
    }
    df = pd.DataFrame(data)
    
    result = engineer_features(df)
    
    expected_cols = [
        'hour', 'dayOfWeek', 'aqi_24h', 'rollingAvg72h',
        'target_aqi_24h', 'target_pm25_24h', 'target_pm10_24h',
        'target_aqi_72h'
    ]
    
    for col in expected_cols:
        assert col in result.columns, f"Missing column {col}"
    
    # Check that NaN targets were dropped
    assert not result['target_aqi_72h'].isna().any()
