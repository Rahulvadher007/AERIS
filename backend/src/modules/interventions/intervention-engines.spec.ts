import { InterventionScoringEngine } from './intervention-scoring.engine';
import { InterventionRulesEngine } from './intervention-rules.engine';
import { InterventionSimulationEngine } from './intervention-simulation.engine';

describe('Intervention Intelligence Engines', () => {
  describe('Scoring Engine', () => {
    it('should assign CRITICAL priority for severe overlapping metrics', () => {
      // aqi=360(40pt) + forecast worsening(20pt) + traffic=95(20pt) = 80 => CRITICAL
      const result = InterventionScoringEngine.computePriorityScore(
        360,
        440,
        95,
        0,
        5.0,
        50,
        25,
      );
      expect(result.priority).toBe('CRITICAL');
      expect(result.riskLevel).toBe('EMERGENCY');
    });

    it('should assign LOW priority for calm metrics', () => {
      const result = InterventionScoringEngine.computePriorityScore(
        50,
        45,
        20,
        0,
        5.0,
        50,
        25,
      );
      expect(result.priority).toBe('LOW');
    });
  });

  describe('Rules Engine', () => {
    it('should trigger public health advisory for AQI > 300 with stagnation', () => {
      const result = InterventionRulesEngine.evaluate(
        380,
        320,
        160,
        50,
        30,
        0,
        1.5,
        85,
        10,
      );
      expect(result.actions).toContain(
        'Issue public health advisory for vulnerable groups to remain indoors',
      );
      expect(result.actions).toContain(
        'Deploy outdoor mist canons & smog guns at major intersections',
      );
      expect(result.actions).toContain(
        'Enforce strict ban on municipal solid waste and biomass burning',
      );
    });

    it('should trigger hotspot mitigation actions if >=3 hotspots', () => {
      const result = InterventionRulesEngine.evaluate(
        180,
        210,
        140,
        45,
        50,
        4,
        3.5,
        55,
        28,
      );
      expect(result.actions).toContain(
        'Temporarily halt construction and demolition activities within 2km',
      );
      expect(result.actions).toContain(
        'Enforce mandatory dust screens and water misting at active sites',
      );
    });
  });

  describe('Simulation Engine', () => {
    it('should estimate specific AQI reduction and post-intervention AQI', () => {
      const actions = [
        'Enforce odd-even vehicle restrictions for non-essential transit',
        'Deploy outdoor mist canons & smog guns at major intersections',
      ];
      // odd-even: 14%, mist canons: 6% = 20%
      const result = InterventionSimulationEngine.simulateImpact(
        actions,
        300,
        4.0,
        50,
        25,
      );

      expect(result.estimatedAQIReduction).toBe('20%');
      expect(result.postInterventionAQI).toBe(240);
    });

    it('should cap reductions at 40%', () => {
      const actions = [
        'Enforce odd-even vehicle restrictions for non-essential transit', // 14%
        'Reroute heavy commercial vehicles via outer bypass roads', // 10%
        'Temporarily halt construction and demolition activities within 2km', // 8%
        'Deploy outdoor mist canons & smog guns at major intersections', // 6%
        'Enforce mandatory dust screens and water misting at active sites', // 0% (no match, but we got our cap)
      ]; // Total 38% + triggered by wet-suppression etc.
      const result = InterventionSimulationEngine.simulateImpact(
        actions,
        400,
        3.0,
        50,
        25,
      );

      expect(
        Number(result.estimatedAQIReduction.replace('%', '')),
      ).toBeLessThanOrEqual(40);
      expect(result.postInterventionAQI).toBeGreaterThanOrEqual(240);
    });
  });
});
