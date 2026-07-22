import { Controller, Get, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get rule-based actionable recommendations' })
  getRecommendations(@Query('city') city?: string) {
    return this.recommendationsService.getRecommendations(city);
  }
}
