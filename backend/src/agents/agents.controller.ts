import { Controller, Post, Get } from '@nestjs/common';
import { CoordinatorAgent } from './coordinator.agent';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly coordinatorAgent: CoordinatorAgent) {}

  @Post('coordinate')
  @ApiOperation({ summary: 'Trigger a manual multi-agent coordination sweep' })
  async triggerCoordination() {
    const result = await this.coordinatorAgent.coordinateSweep();
    return {
      success: true,
      message: 'Multi-agent coordination sweep executed successfully.',
      data: result,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check status of the 9 AI Agents' })
  getAgentsStatus() {
    return {
      success: true,
      agents: [
        { name: 'AQIAgent', status: 'ACTIVE', role: 'Data cleaning and AQI validation' },
        { name: 'WeatherAgent', status: 'ACTIVE', role: 'Meteorological dispersion modeling' },
        { name: 'TrafficAgent', status: 'ACTIVE', role: 'Vehicular emission impact analysis' },
        { name: 'ForecastAgent', status: 'ACTIVE', role: 'XGBoost predictive forecasting' },
        { name: 'HotspotAgent', status: 'ACTIVE', role: 'Spatial DBSCAN clustering' },
        { name: 'SourceAttributionAgent', status: 'ACTIVE', role: 'Source apportionment analysis' },
        { name: 'InterventionAgent', status: 'ACTIVE', role: 'Mitigation planning and Counterfactual simulation' },
        { name: 'CitizenAdvisoryAgent', status: 'ACTIVE', role: 'Plain-language advisory alerts' },
        { name: 'CoordinatorAgent', status: 'ACTIVE', role: 'Multi-agent system orchestration' },
      ]
    };
  }
}
