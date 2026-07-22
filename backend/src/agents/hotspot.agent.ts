import { Injectable, Logger } from '@nestjs/common';
import { HotspotsService } from '../modules/hotspots/hotspots.service';

@Injectable()
export class HotspotAgent {
  private readonly logger = new Logger(HotspotAgent.name);

  constructor(private readonly hotspotsService: HotspotsService) {}

  /**
   * Runs the DBSCAN clustering algorithm to identify spatial pollution hotspots.
   */
  async detectHotspots(): Promise<any> {
    this.logger.log(
      'Hotspot Agent: Running spatial DBSCAN clustering sweep...',
    );
    await this.hotspotsService.calculateAndStoreHotspots();
    const activeHotspots = await this.hotspotsService.getLatestHotspots();
    this.logger.log(
      `Hotspot Agent: Detected ${activeHotspots.length} active hotspots.`,
    );
    return activeHotspots;
  }
}
