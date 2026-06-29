import { Controller, Post, Get, Delete } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Trigger immediate sync sweep of external live APIs' })
  async triggerSync() {
    await this.ingestionService.ingestAllStationsLive();
    return {
      success: true,
      message: 'Ingestion sync sweep executed successfully.',
      stats: this.ingestionService.getStats(),
    };
  }

  @Post('import-historical')
  @ApiOperation({ summary: 'Bulk import historical baseline datasets' })
  async triggerHistoricalImport() {
    const res = await this.ingestionService.importHistoricalData();
    return {
      success: true,
      message: 'Historical bulk import completed successfully.',
      data: res,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current ingestion statistics and cache status' })
  getStatus() {
    return {
      success: true,
      stats: this.ingestionService.getStats(),
    };
  }

  @Delete('stats')
  @ApiOperation({ summary: 'Reset ingestion statistics' })
  resetStats() {
    this.ingestionService.resetStats();
    return {
      success: true,
      message: 'Ingestion statistics reset successfully.',
    };
  }
}
