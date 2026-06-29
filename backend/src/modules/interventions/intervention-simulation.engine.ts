export class InterventionSimulationEngine {
  static simulateImpact(
    actions: string[],
    currentAQI: number,
    windSpeed: number,
    humidity: number,
    temperature: number
  ) {
    let reductionPercentage = 0;

    // 1. Assign dynamic base impact values to actions
    actions.forEach(action => {
      if (action.includes('odd-even vehicle restrictions')) reductionPercentage += 14;
      else if (action.includes('Reroute heavy commercial vehicles')) reductionPercentage += 10;
      else if (action.includes('halt construction')) reductionPercentage += 8;
      else if (action.includes('mist canons')) reductionPercentage += 6;
      else if (action.includes('ban on municipal solid waste')) reductionPercentage += 5;
      else if (action.includes('mechanical road sweeping')) reductionPercentage += 4;
      else if (action.includes('signal timings')) reductionPercentage += 3;
      else if (action.includes('wet-suppression')) reductionPercentage += 4;
      else if (action.includes('diesel exhaust emissions')) reductionPercentage += 3;
    });

    // 2. Apply meteorological scaling factors
    // If wind speed is high, local actions have less relative impact because natural dispersion dominates
    if (windSpeed > 6.0) {
      reductionPercentage *= 0.6;
    } 
    // If wind speed is extremely low (stagnation), local emission reductions are highly effective
    else if (windSpeed < 2.0) {
      reductionPercentage *= 1.25;
    }

    // High humidity can cause aerosols to swell and stay suspended, slightly reducing action effectiveness
    if (humidity > 80) {
      reductionPercentage *= 0.9;
    }

    // Limit maximum possible 24h reduction to 40% (physical limit)
    reductionPercentage = Math.min(reductionPercentage, 40);
    reductionPercentage = Number(reductionPercentage.toFixed(1));

    // 3. Convert to AQI points
    const aqiReductionAmount = currentAQI * (reductionPercentage / 100);
    const postInterventionAQI = Math.round(currentAQI - aqiReductionAmount);

    // 4. Calculate dynamic confidence score
    // Lower confidence under volatile high wind speeds or extreme humidity
    let confidenceScore = 0.90;
    if (windSpeed > 6.0) confidenceScore -= 0.08;
    if (humidity > 85) confidenceScore -= 0.04;
    if (actions.length > 5) confidenceScore -= 0.05; // Multi-intervention complexity increases uncertainty
    confidenceScore = Math.max(0.60, Math.min(0.95, confidenceScore));
    confidenceScore = Number(confidenceScore.toFixed(2));

    // 5. Determine expected impact description
    let expectedImpact = 'Minor ambient air quality maintenance';
    if (reductionPercentage > 25) {
      expectedImpact = 'High-impact localized stabilization and washout';
    } else if (reductionPercentage > 12) {
      expectedImpact = 'Moderate pollutant dilution and traffic emission relief';
    }

    return {
      estimatedAQIReduction: `${reductionPercentage}%`,
      postInterventionAQI,
      expectedImpact,
      confidenceScore,
    };
  }
}
