# Task A.2 Report: Route-Level error.tsx and loading.tsx for All Data Pages

## Files Created (27 total)

### Shared Components (2)
- `frontend/src/components/PageErrorBoundary.client.tsx` — Client component error boundary UI
- `frontend/src/components/PageSkeleton.tsx` — Server component loading skeleton

### Dashboard Layout (1)
- `frontend/src/app/dashboard/layout.tsx` — Server component layout wrapping dashboard in min-h-screen bg-zinc-950 container

### error.tsx (12)
- `frontend/src/app/dashboard/error.tsx` — "Command Center Offline"
- `frontend/src/app/stations/error.tsx` — "Station Data Unavailable"
- `frontend/src/app/aqi/error.tsx` — "AQI Data Unavailable"
- `frontend/src/app/weather/error.tsx` — "Weather Data Unavailable"
- `frontend/src/app/traffic/error.tsx` — "Traffic Data Unavailable"
- `frontend/src/app/forecast/error.tsx` — "Forecast Data Unavailable"
- `frontend/src/app/hotspots/error.tsx` — "Hotspot Data Unavailable"
- `frontend/src/app/heatmap/error.tsx` — "Heatmap Unavailable"
- `frontend/src/app/evidence/error.tsx` — "Evidence Data Unavailable"
- `frontend/src/app/advisories/error.tsx` — "Advisories Unavailable"
- `frontend/src/app/interventions/error.tsx` — "Interventions Unavailable"
- `frontend/src/app/recommendations/error.tsx` — "Recommendations Unavailable"

### loading.tsx (12)
- All 12 pages use `PageSkeleton` with:
  - `dashboard/loading.tsx` — `rows={8}`
  - All others — `rows={6}`

## "use client" Stripping Attempt

**Dashboard page (`dashboard/page.tsx`):** Tried stripping "use client". **Failed.**

Build error: `ssr: false` is not allowed with `next/dynamic` in Server Components. The file uses `GisMap = dynamic(() => import(...), { ssr: false })` which requires the module to be a Client Component. Restored "use client".

**Dashboard content** also uses `useState`, `useQuery`, `useCity` inside `DashboardPageContent`, but the `ssr: false` dynamic import is the blocking issue.

**Result:** All 12 pages keep "use client". The wrapper pattern (Suspense-wrapped default export) isn't sufficient to make them server-safe because:
1. Dashboard — `ssr: false` dynamic import and hooks inside the internal component
2. Stations — `useSearchParams`, `useState` inside the internal component + `ssr: false` dynamic import  
3. AQI, weather, traffic, forecast, hotspots, heatmap, evidence, advisories, interventions, recommendations — all use hooks directly in the default export

## Build Result

**Successful.** All routes compile and generate static pages without errors.

## Pages in Build Output
`/`, `/_not-found`, `/advisories`, `/aqi`, `/dashboard`, `/evidence`, `/forecast`, `/heatmap`, `/hotspots`, `/interventions`, `/recommendations`, `/settings`, `/stations`, `/traffic`, `/weather` — all `○ (Static)` prerendered.
