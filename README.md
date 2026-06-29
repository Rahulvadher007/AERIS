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
</div>

---

## 📖 Table of Contents

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
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Data Sources](#-data-sources)
- [Machine Learning](#-machine-learning)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌍 Project Description

**AERIS (Air Environmental Response & Intelligence System)** is an advanced, AI-powered Environmental Intelligence Platform designed to transform how cities monitor, analyze, and mitigate urban air pollution. 

Air pollution remains one of the most critical urban challenges globally, directly impacting public health, economic productivity, and climate stability. Traditional Air Quality Index (AQI) dashboards only report historical or current data, lacking predictive capabilities and actionable insights. 

AERIS bridges this gap by fusing real-time environmental data (AQI, Weather, Traffic) with spatial clustering and machine learning forecasting. By transforming raw multidimensional data into actionable intelligence, AERIS provides immense value for Smart City initiatives, Municipal Corporations, Environmental Protection Agencies (like CPCB), and urban researchers to implement proactive, data-driven interventions before pollution peaks occur.

---

## 🚨 Problem Statement

Urban environments face acute challenges in managing air quality:
- **Disconnected Datasets:** Weather, traffic congestion, and air quality data are typically siloed, making it impossible to identify correlations.
- **Reactive vs. Proactive:** Current systems inform the public *after* hazardous pollution levels are reached.
- **Lack of Micro-Level Insight:** Traditional monitoring provides city-level averages, masking localized highly-polluted "hotspots".
- **Decision Paralysis:** Without AI-driven recommendations, city planners lack real-time guidance on optimal intervention strategies (e.g., rerouting traffic, halting construction).

---

## 💡 Solution

AERIS integrates multiple intelligence layers into a single Command Center:
- **Continuous Ingestion:** Aggregates live data from Air Quality sensors, Weather APIs, Traffic APIs, and Satellite Intelligence.
- **Spatial Clustering:** Utilizes Density-Based Spatial Clustering (DBSCAN) to identify and isolate active pollution hotspots.
- **Machine Learning Forecasting:** Employs XGBoost algorithms to predict 24h, 48h, and 72h AQI trends based on complex meteorological and traffic interactions.
- **Autonomous Recommendations & Interventions:** An AI engine processes predictive data to generate automated, context-aware mitigation strategies, acting as an intelligent co-pilot for urban administrators.

---

## ✨ Key Features

- **Live AQI Monitoring:** Real-time pollutant tracking (PM2.5, PM10, NO2, CO, O3) across monitoring stations.
- **Multi-City Support:** Scalable architecture seamlessly supports regional and national deployment.
- **Weather Integration:** Correlates humidity, temperature, and wind vectors with pollution dispersion.
- **Traffic Intelligence:** Analyzes real-time road congestion as a primary emission source.
- **Geospatial Heatmaps:** High-performance interactive maps visualizing pollutant concentrations.
- **Hotspot Detection:** Automated spatial clustering algorithms identify micro-zones of severe pollution.
- **XGBoost Forecasting:** Highly accurate ML predictions for upcoming environmental hazards.
- **AI Recommendation Engine:** Generates localized advisories for vulnerable populations.
- **Intervention Planning:** Actionable municipal strategies (e.g., deploying water sprinklers, redirecting heavy vehicles).
- **Dynamic Dashboard:** A premium, "glassmorphism" styled command center UI.
- **REST APIs:** Fully documented, secure backend endpoints.

---

## 🏗 System Architecture

```mermaid
graph TD
    Client[Frontend Client - Next.js] -->|HTTP/REST| API[Backend API - NestJS]
    
    subgraph Core Backend [NestJS Backend Services]
        API --> Stations[Stations Module]
        API --> AQI[AQI Module]
        API --> Traffic[Traffic Module]
        API --> Weather[Weather Module]
        API --> GIS[GIS Module]
    end

    subgraph Database Layer [PostgreSQL + Prisma]
        Stations --> DB[(PostgreSQL)]
        AQI --> DB
        Traffic --> DB
        Weather --> DB
    end

    subgraph AI Intelligence Layer [ML & Agents]
        API --> Forecasting[XGBoost Forecast Engine]
        API --> Clustering[Hotspot DBSCAN]
        API --> Engine[Intervention AI Engine]
    end

    subgraph External Data Sources
        AQI -.->|Fetch| OpenAQ[OpenAQ API]
        Weather -.->|Fetch| OpenWeather[OpenWeather API]
        Traffic -.->|Fetch| TomTom[TomTom API]
        DB -.->|Seed| Kaggle[Kaggle Datasets]
    end
```

---

## 🔄 Data Pipeline

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

## 🛠 Technology Stack

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

## 📂 Project Structure

```text
aeris/
├── frontend/                 # Next.js Web Application
│   ├── public/               # Static assets & Official Logo
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components & Layouts
│   │   ├── contexts/         # React Context (e.g., Global City State)
│   │   ├── services/         # Axios API client integrations
│   │   └── types/            # TypeScript interfaces
├── backend/                  # NestJS API Server
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── modules/          # Domain-driven modules (AQI, Traffic, Weather)
│   │   ├── agents/           # Autonomous AI logic (Interventions, Recommendations)
│   │   └── common/           # Interceptors, Filters, and DTOs
├── ml-service/               # (Optional/Future) Dedicated Python FastAPI ML microservice
└── README.md                 # Project Documentation
```

---

## 🗄 Database Design

AERIS utilizes a highly relational PostgreSQL schema to maintain data integrity across urban domains:

- **`Stations`**: Core spatial nodes representing physical monitoring locations (Latitude, Longitude, City).
- **`AQI Readings`**: Time-series logs of pollutant concentrations (PM2.5, PM10, etc.) linked to Stations.
- **`Weather`**: Meteorological records (Temperature, Humidity, Wind Speed/Direction) correlated temporally with AQI.
- **`Traffic`**: Roadway congestion indices and traffic flow speeds near monitoring stations.
- **`Forecasts`**: ML-generated future AQI predictions.
- **`Hotspots`**: Clustered geographical zones exhibiting critically high pollution levels.
- **`Recommendations`**: Citizen-facing health and advisory actions.
- **`Interventions`**: Authority-facing municipal mitigation strategies.

---

## 🧠 AI Modules

1. **Forecast Engine**: Analyzes historical AQI, weather patterns, and temporal features to output highly accurate 24h, 48h, and 72h predictions, preventing unexpected environmental hazards.
2. **Hotspot Detection**: Utilizes spatial algorithms to cluster high-pollution nodes, creating dynamic "danger zones" rather than treating stations as isolated entities.
3. **Recommendation Engine**: Translates complex environmental metrics into simple, context-aware health advisories for citizens (e.g., "Limit outdoor exercise due to PM2.5 spikes").
4. **Intervention Intelligence**: An autonomous agent that cross-references traffic, weather, and AQI to suggest municipal actions (e.g., "Reroute heavy vehicles from Zone A due to stagnant wind conditions").

---

## 🔌 APIs

The NestJS backend exposes secure, scalable REST endpoints. Key routes include:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stations` | Retrieve all monitoring stations with spatial data. |
| `GET` | `/aqi/live` | Fetch real-time pollutant readings globally or by city. |
| `GET` | `/weather/live` | Fetch current meteorological conditions. |
| `GET` | `/traffic/latest` | Retrieve localized road congestion metrics. |
| `GET` | `/gis/heatmap` | Obtain formatted GeoJSON data for Map layer rendering. |
| `GET` | `/forecast/24h` | Retrieve ML-generated 24-hour predictive data. |
| `GET` | `/hotspots` | Fetch currently active pollution clusters. |
| `POST`| `/interventions/generate`| Trigger AI agent to generate new mitigation strategies. |

---

## ⚙️ Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Rahulvadher007/AERIS.git
cd AERIS
```

### 2. Backend Setup
```bash
cd backend
npm install
```
**Environment Variables**: Create a `.env` file in the `backend` directory.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aeris"
PORT=3001
OPENWEATHER_API_KEY="your_api_key"
TOMTOM_API_KEY="your_api_key"
OPENAQ_API_KEY="your_api_key"
```

**Database Initialization**:
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
**Environment Variables**: Create a `.env.local` file in the `frontend` directory.
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 🚀 Running the Project

For proper operation, services must be started in this order:

1. **Database**: Ensure your PostgreSQL instance is running.
2. **Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```
   *The API will be available at `http://localhost:3001`*
3. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *The Command Center will be available at `http://localhost:3000`*

---

## 📡 Data Sources

AERIS is built for real-world application and utilizes live production data:
- **[Kaggle Historical Air Quality Datasets](https://www.kaggle.com/)**: Used for training the predictive ML models.
- **[OpenAQ](https://openaq.org/)**: Primary source for live, global air quality station readings.
- **[OpenWeather](https://openweathermap.org/)**: Real-time meteorological data for dispersion analysis.
- **[TomTom Traffic API](https://developer.tomtom.com/)**: Live routing and congestion indices.

*(Note: No mock data is used in production. The platform relies entirely on verifiable API ingestion).*

---

## 🤖 Machine Learning

- **Algorithm**: **XGBoost** (Extreme Gradient Boosting) was selected due to its exceptional performance on tabular time-series data and robust handling of non-linear environmental relationships.
- **Input Features**: Historical AQI (T-1, T-2), Temperature, Humidity, Wind Speed, Traffic Congestion Index, Time of Day, Day of Week.
- **Output Predictions**: Continuous AQI values forecasted for T+24h, T+48h, and T+72h.
- **Training**: Models are trained on extensive historical Kaggle datasets augmented with seasonal variance.
- **Evaluation Metrics**: Models are evaluated using RMSE (Root Mean Square Error) and MAE (Mean Absolute Error).
- **Future Improvements**: Transitioning to hybrid LSTM-XGBoost architectures for deeper sequential memory capture.

---

## 🛣 Future Roadmap

- [ ] **Authentication & RBAC**: Secure login for municipal authorities vs. public dashboard access.
- [ ] **Satellite Imagery Integration**: Ingesting Sentinel-5P NO2 column data.
- [ ] **Drone Integration**: Real-time localized aerial AQI mapping for acute chemical spills or fires.
- [ ] **IoT Sensor Network**: Supporting proprietary, low-cost LoRaWAN hardware sensors.
- [ ] **Citizen Mobile App**: React Native application for real-time push notification advisories.
- [ ] **National Scale Deployment**: Cloud-native Kubernetes orchestration for nationwide grid coverage.

---

## 🤝 Team

| Name | Role | GitHub |
|------|------|--------|
| **Rahul Vadher** | Principal Architect & Full Stack Engineer | [@Rahulvadher007](https://github.com/Rahulvadher007) |

*(Add other contributors here)*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

Special thanks to the open-source communities and data providers that made this possible:
- **Data Providers**: OpenAQ, OpenWeather, TomTom, Kaggle.
- **Core Technologies**: React, Next.js, NestJS, Prisma, PostgreSQL, FastAPI, XGBoost.
- **UI/UX Inspiration**: Framer Motion, TailwindCSS, Lucide Icons.

---

<div align="center">
  <sub>Built with ❤️ for a cleaner, smarter, and more breathable urban future.</sub>
</div>
