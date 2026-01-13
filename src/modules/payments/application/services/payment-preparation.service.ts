import { Injectable } from '@nestjs/common';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

export interface PreparedPaymentData {
  reference: string;
  adjustedAmount: number;
  currency: string;
  acceptanceToken: string;
  personalAuthToken: string;
}

@Injectable()
export class PaymentPreparationService {
  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
  ) {}

  async prepare(dto: ProcessPaymentDto): Promise<PreparedPaymentData> {
    const [acceptanceToken, personalAuthToken] = await Promise.all([
      this.wompiIntegrationService.getAcceptanceToken(),
      this.wompiIntegrationService.getPersonalAuthToken(),
    ]);

    return {
      reference: this.generateReference(),
      adjustedAmount: this.adjustAmount(dto.amountInCents, dto.currency),
      currency: dto.currency || 'COP',
      acceptanceToken,
      personalAuthToken,
    };
  }

  private generateReference(): string {
    return `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;
  }

  private adjustAmount(amount: number, currency?: string): number {
    if (currency === 'COP') {
      return Math.round(amount / 100) * 100;
    }
    return amount;
  }
}
