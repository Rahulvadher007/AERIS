import os
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv('../.env')

def build_dataset():
    DATABASE_URL = os.getenv('DATABASE_URL')
    if not DATABASE_URL:
        raise Exception("DATABASE_URL not found in environment variables.")

    conn = psycopg2.connect(DATABASE_URL)
    
    print("Loading AQI data...")
    query_aqi = """
        SELECT "stationId", timestamp, aqi, pm25, pm10 
        FROM aqi_readings 
        ORDER BY timestamp ASC
    """
    df_aqi = pd.read_sql(query_aqi, conn)

    print("Loading Weather data...")
    query_weather = """
        SELECT "stationId", timestamp, temperature, humidity, "windSpeed", "windDirection", pressure, rainfall 
        FROM weather_data 
        ORDER BY timestamp ASC
    """
    df_weather = pd.read_sql(query_weather, conn)
    
    # We round timestamps to nearest hour to merge easily
    df_aqi['timestamp'] = pd.to_datetime(df_aqi['timestamp']).dt.floor('h')
    df_weather['timestamp'] = pd.to_datetime(df_weather['timestamp']).dt.floor('h')
    
    print("Loading Traffic Data...")
    # Traffic is by road, we will aggregate it globally per hour for simplicity, or by zone.
    # To keep it tabular by station, we will take the city-wide average traffic per hour as a feature, 
    # since we don't have direct station-to-road mapping.
    query_traffic = """
        SELECT timestamp, "congestionScore", "vehicleCount" 
        FROM traffic_data
    """
    df_traffic = pd.read_sql(query_traffic, conn)
    df_traffic['timestamp'] = pd.to_datetime(df_traffic['timestamp']).dt.floor('h')
    df_traffic_agg = df_traffic.groupby('timestamp').agg({
        'congestionScore': 'mean',
        'vehicleCount': 'sum'
    }).reset_index()

    conn.close()

    print("Merging datasets...")
    # Merge AQI and Weather on stationId and timestamp
    df_merged = pd.merge(df_aqi, df_weather, on=['stationId', 'timestamp'], how='left')
    
    # Merge Traffic by timestamp
    df_merged = pd.merge(df_merged, df_traffic_agg, on='timestamp', how='left')
    
    # Handle missing values via forward fill then backward fill
    df_merged = df_merged.sort_values(by=['stationId', 'timestamp'])
    df_merged = df_merged.groupby('stationId').ffill().bfill().reset_index(drop=True)
    df_merged = df_merged.fillna(0) # For any remaining NaNs

    # Add back the dropped index columns from groupby ffill
    df_merged['stationId'] = df_aqi['stationId']
    df_merged['timestamp'] = df_aqi['timestamp']
    
    # Export
    os.makedirs('data', exist_ok=True)
    dataset_path = 'data/master_dataset.csv'
    df_merged.to_csv(dataset_path, index=False)
    print(f"Dataset generated at {dataset_path} with {len(df_merged)} records.")
    return dataset_path

if __name__ == '__main__':
    build_dataset()
