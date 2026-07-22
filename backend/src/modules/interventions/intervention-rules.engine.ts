export class InterventionRulesEngine {
  static evaluate(
    aqi: number,
    forecastAQI: number,
    pm10: number,
    no2: number,
    trafficCongestion: number,
    hotspotCount: number,
    windSpeed: number,
    humidity: number,
    temperature: number,
  ): { title: string; description: string; actions: string[] } {
    const actions: string[] = [];
    let title = 'Routine Monitoring';
    let description =
      'Ambient air quality and microclimate parameters are within acceptable baselines.';

    // 1. Identify dominant pollution source (Source Attribution)
    const trafficWeight = trafficCongestion * 0.8;
    const hotspotWeight = hotspotCount * 15;
    const stagnationWeight = windSpeed < 2.0 ? 50 : 10;

    const maxWeight = Math.max(trafficWeight, hotspotWeight, stagnationWeight);

    if (aqi > 100) {
      if (maxWeight === trafficWeight && trafficCongestion > 60) {
        title = 'Traffic-Induced Smog Mitigation';
        description = `High traffic congestion (${Math.round(trafficCongestion)}%) is the dominant contributor to local pollutant build-up. Focus on vehicular emission controls.`;
      } else if (maxWeight === hotspotWeight && hotspotCount > 0) {
        title = 'Particulate Hotspot Suppression';
        description = `Active localized hotspots (${hotspotCount} detected) are triggering high particulate levels. Focus on fugitive dust and industrial control.`;
      } else if (maxWeight === stagnationWeight && windSpeed < 2.0) {
        title = 'Stagnant Air Dispersion Alert';
        description = `Low wind speed (${windSpeed} m/s) is trapping emissions. Activating emergency dispersion and smog mitigation protocols.`;
      } else {
        title = 'Ambient Air Quality Alert';
        description = `Elevated AQI (${Math.round(aqi)}) detected under mixed atmospheric conditions. Implementing general pollution control measures.`;
      }
    }

    // 2. Map actions dynamically based on thresholds and meteorological factors

    // Stagnation / Weather actions
    if (windSpeed < 2.2) {
      actions.push(
        'Deploy outdoor mist canons & smog guns at major intersections',
      );
      actions.push('Activate smog towers at maximum filtration capacity');
    }
    if (humidity > 80 && temperature < 18 && aqi > 200) {
      actions.push(
        'Enforce strict ban on municipal solid waste and biomass burning',
      );
    }

    // Vehicular / Traffic actions
    if (trafficCongestion > 75) {
      actions.push(
        'Enforce odd-even vehicle restrictions for non-essential transit',
      );
      actions.push(
        'Deploy traffic marshals to clear bottlenecks and minimize idling',
      );
      actions.push('Reroute heavy commercial vehicles via outer bypass roads');
    } else if (trafficCongestion > 50) {
      actions.push(
        'Optimize traffic signal timings to reduce stop-and-go emissions',
      );
    }

    // Industrial / Dust / Hotspot actions
    if (hotspotCount >= 3) {
      actions.push(
        'Temporarily halt construction and demolition activities within 2km',
      );
      actions.push(
        'Enforce mandatory dust screens and water misting at active sites',
      );
      actions.push('Shut down non-compliant small-scale industrial units');
    } else if (hotspotCount >= 1) {
      actions.push(
        'Increase frequency of mechanical road sweeping and water washing',
      );
    }

    // Pollutant-specific actions
    if (pm10 > 150) {
      actions.push(
        'Enforce wet-suppression on unpaved roads and construction corridors',
      );
    }
    if (no2 > 80) {
      actions.push(
        'Conduct intensive on-road remote sensing of diesel exhaust emissions',
      );
    }

    // High AQI / Public Health advisories
    if (aqi > 300) {
      actions.push(
        'Issue public health advisory for vulnerable groups to remain indoors',
      );
      actions.push(
        'Transition schools to online learning and restrict outdoor activities',
      );
    }

    // Fallback if clean
    if (actions.length === 0) {
      actions.push('Maintain regular sensor telemetry monitoring');
    }

    // Deduplicate actions
    const uniqueActions = Array.from(new Set(actions));

    return {
      title,
      description,
      actions: uniqueActions,
    };
  }
}
