import { Controller, Get, Query, Post } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Forecast')
@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('24h')
  @ApiOperation({ summary: 'Get 24-hour AQI forecast' })
  @ApiQuery({ name: 'station', required: true, example: 'VAD001' })
  getForecast24h(@Query('station') station: string) {
    return this.forecastService.getForecast24h(station);
  }

  @Get('48h')
  @ApiOperation({ summary: 'Get 48-hour AQI forecast' })
  @ApiQuery({ name: 'station', required: true, example: 'VAD001' })
  getForecast48h(@Query('station') station: string) {
    return this.forecastService.getForecast48h(station);
  }

  @Get('72h')
  @ApiOperation({ summary: 'Get 72-hour AQI forecast' })
  @ApiQuery({ name: 'station', required: true, example: 'VAD001' })
  getForecast72h(@Query('station') station: string) {
    return this.forecastService.getForecast72h(station);
  }

  @Post('train')
  @ApiOperation({ summary: 'Trigger ML Retraining Pipeline' })
  triggerTraining() {
    return this.forecastService.triggerRetraining();
  }
}
