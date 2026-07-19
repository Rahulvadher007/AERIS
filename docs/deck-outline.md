# AERIS — Hackathon Presentation Deck Outline

Maps each judging criterion to a live AERIS feature and a concrete demo step.

## 1. Innovation — 25%

- **Slide 1: Satellite + Land-Use Source Attribution**
  - What to show: SourceAttributionAgent fusing Copernicus Sentinel-5P NO2/SO2 and NASA FIRMS thermal anomalies with OSM Overpass land-use/POI features to attribute pollution to specific source types (industrial, traffic, residential, biomass burning) with a confidence score.
  - Feature/endpoint that proves it: `POST /agents/coordinate` (returns per-hotspot attribution + confidence) backed by the `Satellite` and `LandUse` modules.

- **Slide 2: Vulnerability-Aware Citizen Advisories**
  - What to show: CitizenAdvisoryAgent generating multilingual, vulnerability-tailored advisories (elderly/child/respiratory risk badges) via LLM.
  - Feature/endpoint that proves it: `GET /advisories` + `VulnerabilityService` + LLM (Gemini/OpenAI).

## 2. Business Impact — 25%

- **Slide 1: Signal-to-Intervention Pipeline**
  - What to show: End-to-end flow from a live AQI exceedance → hotspot detection → source attribution → recommended intervention → projected health/economic benefit, quantified on `/evidence`.
  - Feature/endpoint that proves it: `/evidence` signal-to-intervention metric + `Interventions` module.

- **Slide 2: Attribution Confidence Drives Action**
  - What to show: How attribution confidence thresholds auto-escalate or defer interventions, reducing wasted civic action.
  - Feature/endpoint that proves it: `POST /agents/coordinate` attribution confidence field + `Recommendations` module.

## 3. Technical Excellence — 20%

- **Slide 1: Live Multi-Source Ingestion**
  - What to show: Real-time ingestion from OpenAQ, OpenWeather, TomTom, Sentinel-5P, FIRMS, OSM Overpass through the `Ingestion` module with no reliance on mock data.
  - Feature/endpoint that proves it: `Ingestion` module + live API calls (synthetic only as fallback).

- **Slide 2: Forecast Evaluation Harness**
  - What to show: An RMSE-vs-persistence evaluation harness (`ml-service/eval_harness.py`) that compares the XGBoost forecast against a naive persistence baseline and reports improvement %. NOTE: the `/evidence` RMSE figure is currently an illustrative placeholder; the harness runs on a held-out series and the live backtest is wired into the evidence endpoint as next-step work.
  - Feature/endpoint that proves it: `eval_harness` (RMSE vs persistence) + `Forecast` module.

## 4. Scalability — 15%

- **Slide 1: Multi-City at Scale**
  - What to show: 141-city coverage with the same pipeline, demonstrating horizontal breadth.
  - Feature/endpoint that proves it: `Stations` module multi-city dataset + `Ingestion` fan-out.

- **Slide 2: Cached Spatial Services**
  - What to show: GIS/LandUse spatial queries served from cache to keep latency flat as city count grows.
  - Feature/endpoint that proves it: `GIS` + `LandUse` cached spatial services.

## 5. User Experience — 15%

- **Slide 1: Multilingual Advisory Cards**
  - What to show: Tamil / Kannada / Hindi advisory cards with clear risk levels and vulnerability badges.
  - Feature/endpoint that proves it: `GET /advisories` + `CitizenAdvisoryAgent` + LLM.

- **Slide 2: Evidence Dashboard**
  - What to show: The `/evidence` page presenting RMSE, attribution confidence, and signal-to-intervention in a judge-friendly, single-screen view.
  - Feature/endpoint that proves it: `/evidence` page + `Evidence` module.
