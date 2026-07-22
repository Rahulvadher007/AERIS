import { Injectable, Logger } from '@nestjs/common';
import { InterventionsService } from '../modules/interventions/interventions.service';

@Injectable()
export class InterventionAgent {
  private readonly logger = new Logger(InterventionAgent.name);

  constructor(private readonly interventionsService: InterventionsService) {}

  /**
   * Generates intervention and mitigation plans for all zones.
   */
  async planInterventions(): Promise<any[]> {
    this.logger.log(
      'Intervention Agent: Running intervention planning and impact simulation sweep...',
    );
    const plans = await this.interventionsService.generateInterventions();
    this.logger.log(
      `Intervention Agent: Generated ${plans.length} intervention plans.`,
    );
    return plans;
  }
}
