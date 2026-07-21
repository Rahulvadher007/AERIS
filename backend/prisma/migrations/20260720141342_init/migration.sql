-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "geometry" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspots" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT,
    "clusterId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "aqi" DOUBLE PRECISION NOT NULL,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "stationCount" INTEGER NOT NULL DEFAULT 1,
    "radius" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "severity" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "windDirection" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aqi_readings" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "aqi" DOUBLE PRECISION NOT NULL,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,
    "co" DOUBLE PRECISION,
    "o3" DOUBLE PRECISION,
    "nh3" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aqi_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_results" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "forecastAQI" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecast_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roads" (
    "id" TEXT NOT NULL,
    "roadCode" TEXT NOT NULL,
    "roadName" TEXT NOT NULL,
    "geometry" JSONB NOT NULL,
    "zoneId" TEXT,

    CONSTRAINT "roads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_data" (
    "id" TEXT NOT NULL,
    "roadId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "congestionScore" INTEGER NOT NULL,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "vehicleCount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "forecastId" TEXT,
    "priority" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendedActions" TEXT[],
    "expectedImpact" TEXT NOT NULL,
    "estimatedAQIReduction" TEXT NOT NULL,
    "postInterventionAQI" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satellite_readings" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "no2" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,
    "thermalAnomaly" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satellite_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "land_use_features" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "land_use_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vulnerability_scores" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "populationDensity" DOUBLE PRECISION,
    "poiCounts" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vulnerability_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisories" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ttsScript" TEXT,
    "recommendedActions" TEXT[],
    "forecastAQI" DOUBLE PRECISION NOT NULL,
    "vulnerabilityScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advisories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stations_stationCode_key" ON "stations"("stationCode");

-- CreateIndex
CREATE UNIQUE INDEX "zones_zoneCode_key" ON "zones"("zoneCode");

-- CreateIndex
CREATE INDEX "weather_data_stationId_idx" ON "weather_data"("stationId");

-- CreateIndex
CREATE INDEX "weather_data_timestamp_idx" ON "weather_data"("timestamp");

-- CreateIndex
CREATE INDEX "weather_data_temperature_idx" ON "weather_data"("temperature");

-- CreateIndex
CREATE INDEX "weather_data_humidity_idx" ON "weather_data"("humidity");

-- CreateIndex
CREATE INDEX "weather_data_windSpeed_idx" ON "weather_data"("windSpeed");

-- CreateIndex
CREATE INDEX "aqi_readings_stationId_idx" ON "aqi_readings"("stationId");

-- CreateIndex
CREATE INDEX "aqi_readings_timestamp_idx" ON "aqi_readings"("timestamp");

-- CreateIndex
CREATE INDEX "aqi_readings_aqi_idx" ON "aqi_readings"("aqi");

-- CreateIndex
CREATE INDEX "forecast_results_stationId_idx" ON "forecast_results"("stationId");

-- CreateIndex
CREATE INDEX "forecast_results_forecastDate_idx" ON "forecast_results"("forecastDate");

-- CreateIndex
CREATE UNIQUE INDEX "roads_roadCode_key" ON "roads"("roadCode");

-- CreateIndex
CREATE INDEX "traffic_data_timestamp_idx" ON "traffic_data"("timestamp");

-- CreateIndex
CREATE INDEX "traffic_data_roadId_idx" ON "traffic_data"("roadId");

-- CreateIndex
CREATE INDEX "traffic_data_congestionScore_idx" ON "traffic_data"("congestionScore");

-- CreateIndex
CREATE INDEX "traffic_data_latitude_longitude_idx" ON "traffic_data"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "interventions_zoneId_idx" ON "interventions"("zoneId");

-- CreateIndex
CREATE INDEX "interventions_priority_idx" ON "interventions"("priority");

-- CreateIndex
CREATE INDEX "interventions_riskLevel_idx" ON "interventions"("riskLevel");

-- CreateIndex
CREATE INDEX "satellite_readings_city_idx" ON "satellite_readings"("city");

-- CreateIndex
CREATE INDEX "satellite_readings_latitude_longitude_idx" ON "satellite_readings"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "satellite_readings_timestamp_idx" ON "satellite_readings"("timestamp");

-- CreateIndex
CREATE INDEX "land_use_features_city_idx" ON "land_use_features"("city");

-- CreateIndex
CREATE INDEX "land_use_features_category_idx" ON "land_use_features"("category");

-- CreateIndex
CREATE UNIQUE INDEX "land_use_features_city_category_latitude_longitude_key" ON "land_use_features"("city", "category", "latitude", "longitude");

-- CreateIndex
CREATE INDEX "vulnerability_scores_zoneId_idx" ON "vulnerability_scores"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "vulnerability_scores_zoneId_key" ON "vulnerability_scores"("zoneId");

-- CreateIndex
CREATE INDEX "advisories_zoneId_idx" ON "advisories"("zoneId");

-- CreateIndex
CREATE INDEX "advisories_city_idx" ON "advisories"("city");

-- AddForeignKey
ALTER TABLE "hotspots" ADD CONSTRAINT "hotspots_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aqi_readings" ADD CONSTRAINT "aqi_readings_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forecast_results" ADD CONSTRAINT "forecast_results_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roads" ADD CONSTRAINT "roads_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_data" ADD CONSTRAINT "traffic_data_roadId_fkey" FOREIGN KEY ("roadId") REFERENCES "roads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vulnerability_scores" ADD CONSTRAINT "vulnerability_scores_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisories" ADD CONSTRAINT "advisories_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
