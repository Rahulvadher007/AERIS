import { InterventionScoringEngine } from './intervention-scoring.engine';
import { InterventionRulesEngine } from './intervention-rules.engine';
import { InterventionSimulationEngine } from './intervention-simulation.engine';

describe('Intervention Intelligence Engines', () => {

  describe('Scoring Engine', () => {
    it('should assign CRITICAL priority for severe overlapping metrics', () => {
      // AQI: 350 (40pt), Traffic: 95 (25pt), Hotspots: 6 (25pt) = 90 (CRITICAL)
      const result = InterventionScoringEngine.computePriorityScore(350, 95, 6);
      expect(result.priority).toBe('CRITICAL');
      expect(result.riskLevel).toBe('EMERGENCY');
    });

    it('should assign LOW priority for calm metrics', () => {
      const result = InterventionScoringEngine.computePriorityScore(50, 20, 0);
      expect(result.priority).toBe('LOW');
    });
  });

  describe('Rules Engine', () => {
    it('should trigger emergency protocols for AQI > 350', () => {
      const result = InterventionRulesEngine.evaluate(380, 50, 20, 40, 0);
      expect(result.actions).toContain('Emergency pollution response');
      expect(result.title).toBe('Critical AQI Emergency');
    });

    it('should trigger multiple hotspot alert if >3 hotspots', () => {
      const result = InterventionRulesEngine.evaluate(150, 50, 20, 40, 4);
      expect(result.actions).toContain('Deploy inspection teams');
      expect(result.title).toBe('Multiple Hotspot Alert');
    });
  });

  describe('Simulation Engine', () => {
    it('should estimate specific AQI reduction and post-intervention AQI', () => {
      const actions = ['Restrict heavy vehicles', 'Deploy water sprinkling units'];
      // Heavy vehicles: 12%, Water sprinkling: 8% = 20%
      const result = InterventionSimulationEngine.simulateImpact(actions, 300);
      
      expect(result.estimatedAQIReduction).toBe('20%');
      // 300 - (300 * 0.20) = 240
      expect(result.postInterventionAQI).toBe(240);
    });

    it('should cap reductions at 35%', () => {
      const actions = [
        'Restrict heavy vehicles', // 12%
        'Restrict freight movement', // 15%
        'Deploy water sprinkling units', // 8%
        'Enforce dust suppression at construction sites', // 5%
      ]; // Total 40% but capped to 35%
      const result = InterventionSimulationEngine.simulateImpact(actions, 400);
      
      expect(result.estimatedAQIReduction).toBe('35%');
      expect(result.postInterventionAQI).toBe(260); // 400 - 140
    });
  });

});
