# AERIS Hackathon Gap-Closure Design

**Date:** 2026-07-19
**Goal:** Close all critical and secondary gaps in AERIS to maximize judging scores against the
"AI-Powered Urban Air Quality Intelligence for Smart City Intervention" problem statement.
**Approach:** Approach 1 — "Real-Data + Fusion Engine" built on the existing NestJS / FastAPI / Next.js / Prisma stack.

---

## 1. Problem & Judging Context

AERIS already covers most PS areas (hyperlocal 24-72h XGBoost forecasting, DBSCAN hotspots,
intervention agents, 141-city multi-city architecture, 9-agent multi-agent system). The gaps that
directly cost points under the judging weights (Innovation 25%, Business Impact 25%, Technical 20%,
Scalability 15%, UX 15%) are:

1. **Source attribution is heuristic, not data-driven** — fixed weights, no satellite/land-use/thermal input, no confidence scores. Judging: "Source attribution accuracy versus ground-truth emission inventories."
2. **No satellite / remote-sensing / land-use data** — PS explicitly lists Sentinel/MODIS. Current ML only merges AQI+weather+traffic.
3. **Seed data is synthetic** — contradicts README "no mock data" claim; fails "forecast RMSE vs persistence baseline" and "attribution vs real inventories" judging. Ethics/disqualification risk.
4. **No LLM multilingual citizen layer** — PS lists LLMs for regional-language communication; current advisory is English-only, city-level, no vulnerability mapping.
5. **No evidence/presentation layer** — judging weighs Presentation 15% and needs visible proof of criteria.

---

## 2. Data & Ingestion Layer (Design Section 1)

Replace synthetic-only seed with **live ingestion + seed fallback**.

- Extend existing `IngestionService` (`backend/src/modules/ingestion`) to pull **live OpenAQ** station readings (AQI, PM2.5, PM10, NO2, CO, O3) by city. Keep `prisma/seed.ts` synthetic data strictly as **fallback** when the API is rate-limited or down.
- New `SatelliteIngestionService` (backend, NestJS module):
  - **Sentinel-5P** NO2/SO2 tropospheric columns via Copernicus Open Access Hub / ASDC.
  - **MODIS thermal anomalies** via NASA FIRMS API.
  - Stored as spatial points/tiles keyed by `city + timestamp`, cached to avoid re-fetch.
- New `LandUseService` (backend): fetch OSM land-use via **Overpass API** per city — industrial areas, construction zones, major road density, hospitals, schools, elderly-care. Cached per city.
- **Evaluation harness** (`ml-service`): split real ingested data into train/hold-out; compute forecast **RMSE/MAE vs persistence baseline**; write results to `ml-service/model/metrics.json` (already present). Feeds the evidence view.

**Dependencies:** OpenAQ API key, Copernicus credentials, NASA FIRMS API key, Overpass (no key). All are open/authorized — satisfies hackathon licensing rules.

---

## 3. Geospatial Source-Attribution Engine (Design Section 2)

Rewrite `SourceAttributionAgent` (`backend/src/agents/source-attribution.agent.ts`) from fixed weights to **feature-driven apportionment**.

- **Inputs per zone:** Sentinel-5P NO2 (traffic + industry proxy), MODIS thermal (biomass/waste burning), OSM land-use fractions (industrial area %, road density, construction zones), live traffic congestion, wind stagnation factor.
- **Method:** positive constrained weighted apportionment. Each source category receives a base from land-use + a modulation from the satellite signal, normalized to 100%. A **confidence score (0-1)** is derived from data completeness and inter-signal agreement.
- **Output schema:**
  ```
  {
    zoneId, zoneName, city,
    attribution: { traffic, industry, construction, biomassBurning, background }, // % summing to 100
    dominantSource,
    confidence,            // 0-1
    supportingEvidence     // list of feeds/satellites that fired
  }
  ```
- **Validation:** correlate output against a **sample public emission inventory** (CPCB / EDGAR) for the evidence view — shows correlation, not just assertion.

Directly answers PS: "Geospatial Pollution Source Attribution Engine ... attributing pollution by source category at ward or zone level with statistical confidence scores."

---

## 4. LLM Citizen Advisory + Vulnerability (Design Section 3)

Upgrade `CitizenAdvisoryAgent` (`backend/src/agents/citizen-advisory.agent.ts`).

- New `VulnerabilityService` (backend): maps OSM hospitals / schools / elderly-care + population density per ward → **vulnerability score (0-1)**.
- `CitizenAdvisoryAgent` calls an **LLM (Gemini / OpenAI)** with: forecast AQI, vulnerability score, ward name → generates advisory in **Hindi / Tamil / Kannada / English** (regional by city).
- **Output (structured JSON):**
  ```
  { message, riskLevel, recommendedActions[], ttsScript, language }
  ```
  `ttsScript` enables IVR / audio playback.
- **Fallback:** rule-based template (existing logic) when LLM key is absent — demo never breaks.
- **Frontend:** advisory cards gain language toggle + vulnerability badge.

Matches PS "Citizen Health Risk Advisory System ... maps population vulnerability ... pushes personalised advisories ... in regional languages."

---

## 5. Evidence & Intervention View + Deliverables (Design Section 4)

- New `/evidence` dashboard panel (Next.js, under `frontend/src/app`):
  - Forecast **RMSE vs persistence** chart (real-data eval).
  - Attribution **confidence vs inventory** scatter.
  - **Signal-to-intervention time** metric (hotspot detect timestamp → intervention generated).
  - Multi-city comparison strip (existing 141 cities).
- **Architecture diagram** (mermaid) updated with fusion + satellite + LLM layers → `docs/architecture.md`.
- **Deck outline** + **demo video script** mapping each judging criterion to a live feature → `docs/`.
- **README fix:** correct "no mock data" claim → "live OpenAQ + satellite with synthetic seed fallback."

---

## 6. Scope, Testing, Risks (Design Section 5)

- **In scope:** ingestion extension, satellite + land-use services, attribution rewrite, LLM advisory + vulnerability, evidence view, deliverables. All within existing stack.
- **Out of scope (YAGNI / roadmap only):** atmospheric dispersion physics model, drone/IoT hardware, full RBAC/auth, Kubernetes.
- **Testing:** jest unit tests for new agents/services (jest already configured); eval harness asserts RMSE < persistence baseline; attribution confidence monotonic with data completeness.
- **Risks & mitigations:**
  - Satellite API rate limits/keys → seed fallback + caching.
  - LLM cost → template fallback.
  - Time → build fusion incrementally; evidence view last.
- **Originality & compliance:** all code written during hackathon; only open datasets/APIs used (OpenAQ, Copernicus, NASA FIRMS, OSM, CPCB/EDGAR) with attribution. Satisfies rules: original work, licensed data with authorization, public submission links.

---

## 7. Success Criteria (maps to judging)

| Criterion | Proof |
|-----------|-------|
| Innovation 25% | Satellite+land-use+LLM fusion engine, not a dashboard |
| Business Impact 25% | Evidence view: intervention time reduction, attribution confidence |
| Technical 20% | Real data ingestion, RMSE vs persistence, modular agents |
| Scalability 15% | 141-city architecture, cached spatial services |
| UX 15% | Multilingual advisory cards, evidence dashboard |
