<div align="center">
  <img src="frontend/public/assets/logo/aeris-logo.png" alt="AERIS Logo" width="200" />
  <h1>AERIS</h1>
  <p><strong>Air Environmental Response & Intelligence System</strong></p>
  <p><em>Air Intelligence. Better Tomorrow.</em></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-10-ea2845?style=for-the-badge&logo=nestjs" alt="NestJS" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
    <a href="https://xgboost.ai/"><img src="https://img.shields.io/badge/XGBoost-ML-blue?style=for-the-badge" alt="XGBoost" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" /></a>
  </p>

  <p>
    <a href="https://frontend-e9or9jxnp-nekmpatel007-9288s-projects.vercel.app/dashboard"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-000?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
    <a href="https://drive.google.com/file/d/1QpR-9YOSrDlM-bUBR-J3NP0Vq5Mwn8V7/view?usp=drive_link"><img src="https://img.shields.io/badge/Watch%20Demo-Video-FF0000?style=for-the-badge&logo=youtube" alt="Demo Video" /></a>
  </p>
</div>

---

## Demo Video

Watch the full demo of AERIS in action:

[![AERIS Demo Video](https://img.shields.io/badge/Click%20to%20Watch%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1QpR-9YOSrDlM-bUBR-J3NP0Vq5Mwn8V7/view?usp=drive_link)

**Video Link:** https://drive.google.com/file/d/1QpR-9YOSrDlM-bUBR-J3NP0Vq5Mwn8V7/view?usp=drive_link

---

## Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | https://frontend-e9or9jxnp-nekmpatel007-9288s-projects.vercel.app |
| **Backend** | Render | https://aeris-rl4g.onrender.com |
| **ML Service** | Render | https://aeris-ml-service.onrender.com |

---

## Table of Contents

- [Project Description](#-project-description)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Data Pipeline](#-data-pipeline)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [AI Modules](#-ai-modules)
- [APIs](#-apis)
- [Deployment](#-deployment)
- [Local Development](#-local-development)
- [Data Sources](#-data-sources)
- [Machine Learning](#-machine-learning)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## Project Description

**AERIS (Air Environmental Response & Intelligence System)** is an advanced, AI-powered Environmental Intelligence Platform designed to transform how cities monitor, analyze, and mitigate urban air pollution. 

Air pollution remains one of the most critical urban challenges globally, directly impacting public health, economic productivity, and climate stability. Traditional Air Quality Index (AQI) dashboards only report historical or current data, lacking predictive capabilities and actionable insights. 

AERIS bridges this gap by fusing real-time environmental data (AQI, Weather, Traffic) with spatial clustering and machine learning forecasting. By transforming raw multidimensional data into actionable intelligence, AERIS provides immense value for Smart City initiatives, Municipal Corporations, Environmental Protection Agencies (like CPCB), and urban researchers to implement proactive, data-driven interventions before pollution peaks occur.

---

## Problem Statement

Urban environments face acute challenges in managing air quality:
- **Disconnected Datasets:** Weather, traffic congestion, and air quality data are typically siloed, making it impossible to identify correlations.
- **Reactive vs. Proactive:** Current systems inform the public *after* hazardous pollution levels are reached.
- **Lack of Micro-Level Insight:** Traditional monitoring provides city-level averages, masking localized highly-polluted "hotspots".
- **Decision Paralysis:** Without AI-driven recommendations, city planners lack real-time guidance on optimal intervention strategies (e.g., rerouting traffic, halting construction).

---

## Solution

AERIS integrates multiple intelligence layers into a single Command Center:
- **Continuous Ingestion:** Aggregates live data from Air Quality sensors, Weather APIs, Traffic APIs, and Satellite Intelligence.
- **Spatial Clustering:** Utilizes Density-Based Spatial Clustering (DBSCAN) to identify and isolate active pollution hotspots.
- **Machine Learning Forecasting:** Employs XGBoost algorithms to predict 24h, 48h, and 72h AQI trends based on complex meteorological and traffic interactions.
- **Autonomous Recommendations & Interventions:** An AI engine processes predictive data to generate automated, context-aware mitigation strategies, acting as an intelligent co-pilot for urban administrators.

---

## Key Features

- **Live AQI Monitoring:** Real-time pollutant tracking (PM2.5, PM10, NO2, CO, O3) across monitoring stations.
- **Multi-City Support:** Scalable architecture seamlessly supports regional and national deployment.
- **Weather Integration:** Correlates humidity, temperature, and wind vectors with pollution dispersion.
- **Traffic Intelligence:** Analyzes real-time road congestion as a primary emission source.
- **Geospatial Heatmaps:** High-performance interactive maps visualizing pollutant concentrations.
- **Hotspot Detection:** Automated spatial clustering algorithms identify micro-zones of severe pollution.
- **XGBoost Forecasting:** Highly accurate ML predictions for upcoming environmental hazards (24h, 48h, 72h).
- **AI Recommendation Engine:** Generates localized advisories for vulnerable populations.
- **Intervention Planning:** Actionable municipal strategies (e.g., deploying water sprinklers, redirecting heavy vehicles).
- **Dynamic Dashboard:** A premium, "glassmorphism" styled command center UI.
- **REST APIs:** Fully documented, secure backend endpoints.

---

## System Architecture

```mermaid
graph TD
    Client[Frontend Client - Next.js] -->|HTTP/REST| API[Backend API - NestJS]
    
    subgraph Core Backend [NestJS Backend Services]
        API --> Stations[Stations Module]
        API --> AQI[AQI Module]
        API --> Traffic[Traffic Module]
        API --> Weather[Weather Module]
        API --> GIS[GIS Module]
        API --> Forecast[Forecast Module]
        API --> Hotspots[Hotspots Module]
        API --> Interventions[Interventions Module]
    end

    subgraph Database Layer [PostgreSQL + Prisma]
        Stations --> DB[(PostgreSQL)]
        AQI --> DB
        Traffic --> DB
        Weather --> DB
        Forecast --> DB
        Hotspots --> DB
        Interventions --> DB
    end

    subgraph AI Intelligence Layer [ML & Agents]
        API --> MLService[ML Service - FastAPI]
        MLService --> XGBoost[XGBoost Models]
        MLService --> DBSCAN[DBSCAN Clustering]
    end

    subgraph External Data Sources
        AQI -.->|Fetch| OpenAQ[OpenAQ API]
        Weather -.->|Fetch| OpenWeather[OpenWeather API]
        Traffic -.->|Fetch| TomTom[TomTom API]
    end
```

---

## Data Pipeline

```mermaid
graph LR
    A[Live AQI] --> E(Data Preprocessing)
    B[Live Weather] --> E
    C[Live Traffic] --> E
    D[Satellite Data] --> E

    E --> F[Feature Engineering]
    
    F --> G[XGBoost ML Models]
    F --> H[DBSCAN Clustering]
    
    G --> I[24h-72h Forecasts]
    H --> J[Hotspot Identification]
    
    I --> K[Recommendation Engine]
    J --> L[Intervention Planning]
    
    K --> M((Command Center Dashboard))
    L --> M
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, Next.js 14, TailwindCSS, Framer Motion | High-performance, SSR UI with premium glassmorphism styling. |
| **Backend** | Node.js, NestJS, TypeScript | Scalable, modular enterprise REST API. |
| **Database** | PostgreSQL, Prisma ORM | Relational data persistence with strict type safety. |
| **AI/ML** | Python, FastAPI, XGBoost, Scikit-Learn | High-speed inference for forecasting and spatial clustering. |
| **Maps** | React Leaflet, GeoJSON | Interactive geospatial visualizations and heatmaps. |
| **Charts** | Recharts | Dynamic data visualization. |
| **External APIs** | OpenAQ, OpenWeather, TomTom | Real-time environmental and urban data ingestion. |

---

## Project Structure

```text
aeris/
├── frontend/                    # Next.js Web Application
│   ├── public/                  # Static assets & Official Logo
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── dashboard/       # Main Command Center
│   │   │   ├── forecast/        # Predictive Forecasting
│   │   │   ├── hotspots/        # Pollution Hotspots
│   │   │   ├── interventions/   # AI Intervention Plans
│   │   │   └── ...
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React Context (City State)
│   │   ├── services/            # Axios API client integrations
│   │   └── types/               # TypeScript interfaces
│   └── vercel.json              # Vercel deployment config
├── backend/                     # NestJS API Server
│   ├── prisma/                  # Database schema & migrations
│   ├── src/
│   │   ├── modules/             # Domain modules (AQI, Traffic, etc.)
│   │   │   ├── aqi/             # AQI monitoring
│   │   │   ├── forecast/        # ML Forecast integration
│   │   │   ├── hotspots/        # DBSCAN hotspot detection
│   │   │   ├── interventions/   # AI intervention engine
│   │   │   ├── stations/        # Station management
│   │   │   ├── traffic/         # Traffic data
│   │   │   └── weather/         # Weather data
│   │   ├── agents/              # Autonomous AI agents
│   │   └── common/              # Interceptors, Filters, DTOs
│   ├── ml-service/              # Python FastAPI ML microservice
│   │   ├── app.py               # FastAPI application
│   │   ├── train.py             # XGBoost training pipeline
│   │   ├── model/               # Trained model files
│   │   └── requirements.txt     # Python dependencies
│   ├── Dockerfile               # Backend container config
│   └── Procfile                 # Render/Railway deployment
├── render.yaml                  # Render deployment blueprint
└── README.md                    # Project Documentation
```

---

## Database Design

AERIS utilizes a highly relational PostgreSQL schema to maintain data integrity across urban domains:

- **`stations`**: Core spatial nodes representing physical monitoring locations (Latitude, Longitude, City).
- **`aqi_readings`**: Time-series logs of pollutant concentrations (PM2.5, PM10, NO2, SO2, CO, O3) linked to Stations.
- **`weather_data`**: Meteorological records (Temperature, Humidity, Wind Speed/Direction, Pressure, Rainfall).
- **`traffic_data`**: Roadway congestion indices, vehicle counts, and traffic flow speeds.
- **`forecast_results`**: ML-generated future AQI predictions (24h, 48h, 72h) with confidence scores.
- **`hotspots`**: Clustered geographical zones exhibiting critically high pollution levels (DBSCAN output).
- **`recommendations`**: Citizen-facing health and advisory actions.
- **`interventions`**: Authority-facing municipal mitigation strategies with estimated AQI reduction.
- **`zones`**: Geographic zones for organizing stations and hotspots.

---

## AI Modules

1. **Forecast Engine**: Analyzes historical AQI, weather patterns, traffic, and temporal features to output highly accurate 24h, 48h, and 72h predictions using XGBoost models.

2. **Hotspot Detection**: Utilizes DBSCAN spatial clustering algorithm to identify and group high-pollution nodes, creating dynamic "danger zones" rather than treating stations as isolated entities.

3. **Intervention Intelligence**: An autonomous agent that cross-references traffic, weather, and AQI to suggest municipal actions (e.g., "Reroute heavy vehicles from Zone A due to stagnant wind conditions").

4. **Source Attribution**: Analyzes traffic congestion, industrial activity, and natural sources to determine pollution contribution percentages.

---

## APIs

The NestJS backend exposes secure, scalable REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stations` | Retrieve all monitoring stations with spatial data |
| `GET` | `/api/stations/cities` | Get list of available cities |
| `GET` | `/api/aqi/live` | Fetch real-time pollutant readings by city |
| `GET` | `/api/weather/latest` | Fetch current meteorological conditions |
| `GET` | `/api/traffic/latest` | Retrieve localized road congestion metrics |
| `GET` | `/api/forecast/24h` | ML 24-hour AQI prediction |
| `GET` | `/api/forecast/48h` | ML 48-hour AQI prediction |
| `GET` | `/api/forecast/72h` | ML 72-hour AQI prediction |
| `GET` | `/api/hotspots` | Fetch currently active pollution clusters |
| `GET` | `/api/interventions` | Get AI-generated intervention plans |
| `GET` | `/api/recommendations` | Get citizen-facing recommendations |
| `POST` | `/api/interventions/generate` | Trigger AI to generate new strategies |

---

## Deployment

### Live Services

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | https://frontend-e9or9jxnp-nekmpatel007-9288s-projects.vercel.app |
| **Backend** | Render | https://aeris-backend.onrender.com |
| **ML Service** | Render | https://aeris-ml-service.onrender.com |
| **Database** | Render PostgreSQL | Internal connection |

### Deploy Your Own

#### 1. Database (Render PostgreSQL)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Plan: **Free**
4. Copy the **Internal Database URL**

#### 2. Backend + ML Service (Render Blueprint)
1. Click "New +" → "Blueprint"
2. Connect GitHub repo: `Rahulvadher007/AERIS`
3. Render will auto-detect `render.yaml`
4. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL internal URL
   - `ML_SERVICE_URL`: Will be set automatically after ML service deploys

#### 3. Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com)
2. Set Root Directory to `frontend`
3. Configure environment variable:
   - `API_URL`: Your backend URL (e.g., `https://aeris-backend.onrender.com`)
4. Deploy!

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL

### 1. Clone the Repository
```bash
git clone https://github.com/Rahulvadher007/AERIS.git
cd AERIS
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/aeris"' > .env
echo 'ML_SERVICE_URL="http://localhost:8000"' >> .env

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Start backend
npm run start:dev
```

### 3. ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt

# Start ML service
uvicorn app:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env.local
echo 'API_URL="http://localhost:3001"' > .env.local

# Start frontend
npm run dev
```

Open http://localhost:3000 to view the dashboard.

---

## Data Sources

AERIS is built for real-world application and utilizes live production data:
- **[OpenAQ](https://openaq.org/)**: Primary source for live, global air quality station readings.
- **[OpenWeather](https://openweathermap.org/)**: Real-time meteorological data for dispersion analysis.
- **[TomTom Traffic API](https://developer.tomtom.com/)**: Live routing and congestion indices.
- **[Kaggle](https://www.kaggle.com/)**: Historical datasets for training ML models.

---

## Machine Learning

- **Algorithm**: **XGBoost** (Extreme Gradient Boosting) - exceptional performance on tabular time-series data.
- **Features (24 total)**:
  - Temporal: hour, day, month, dayOfWeek
  - Meteorological: temperature, humidity, windSpeed, windDirection, pressure, rainfall
  - Traffic: congestionScore, vehicleCount
  - Pollutant: aqi, pm25, pm10
  - Historical: aqi_1h, aqi_3h, aqi_6h, aqi_12h, aqi_24h
  - Statistical: rollingAvg24h, rollingAvg72h, rollingMax24h, rollingMin24h
- **Output Predictions**: AQI values forecasted for T+24h, T+48h, and T+72h with confidence scores.
- **Evaluation**: RMSE and MAE metrics tracked per horizon.

---

## Future Roadmap

- [ ] **Authentication & RBAC**: Secure login for municipal authorities vs. public dashboard access.
- [ ] **Satellite Imagery Integration**: Ingesting Sentinel-5P NO2 column data.
- [ ] **Drone Integration**: Real-time localized aerial AQI mapping.
- [ ] **IoT Sensor Network**: Supporting proprietary, low-cost LoRaWAN hardware sensors.
- [ ] **Citizen Mobile App**: React Native application for real-time push notification advisories.
- [ ] **National Scale Deployment**: Cloud-native Kubernetes orchestration for nationwide coverage.

---

## Team

| Name | Role | GitHub |
|------|------|--------|
| **Rahul Vadher** | Principal Architect & Full Stack Engineer | [@Rahulvadher007](https://github.com/Rahulvadher007) |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Special thanks to the open-source communities and data providers:
- **Data Providers**: OpenAQ, OpenWeather, TomTom, Kaggle
- **Core Technologies**: React, Next.js, NestJS, Prisma, PostgreSQL, FastAPI, XGBoost
- **UI/UX**: Framer Motion, TailwindCSS, Lucide Icons, Recharts

---

<div align="center">
  <sub>Built with ❤️ for a cleaner, smarter, and more breathable urban future.</sub>
</div>
