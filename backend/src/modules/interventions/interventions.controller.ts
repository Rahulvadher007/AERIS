import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { InterventionsService } from './interventions.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Interventions & Decision Support')
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Run analysis across all zones and generate interventions automatically.' })
  async generate() {
    return this.interventionsService.generateInterventions();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Citywide Intervention Dashboard metrics' })
  async getDashboard(@Query('city') city?: string) {
    return this.interventionsService.getDashboard(city);
  }

  @Get('zone/:zoneId')
  @ApiOperation({ summary: 'Get specific intervention plan for a zone' })
  @ApiParam({ name: 'zoneId', required: true })
  async getByZone(@Param('zoneId') zoneId: string) {
    return this.interventionsService.findByZone(zoneId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all generated interventions' })
  async getAll(@Query('city') city?: string) {
    return this.interventionsService.findAll(city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific intervention' })
  @ApiParam({ name: 'id', required: true })
  async getById(@Param('id') id: string) {
    return this.interventionsService.findById(id);
  }
}
