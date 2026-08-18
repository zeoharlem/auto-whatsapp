import { Injectable, Logger } from '@nestjs/common';
import { WhatsappService } from '../../../infrastructure/whatsapp/whatsapp.service';

@Injectable()
export class GetGroupIdByNameUseCase {
  private readonly logger = new Logger(GetGroupIdByNameUseCase.name);

  constructor(private readonly whatsapp: WhatsappService) {}

  async execute(name: string) {
    this.logger.log(`GetGroupIdByNameUseCase.execute(${name})`);
    try {
      await this.whatsapp.getGroupById(name);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
