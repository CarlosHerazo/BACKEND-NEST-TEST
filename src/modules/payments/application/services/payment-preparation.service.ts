import { Injectable } from '@nestjs/common';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import { PriceCalculatorService } from './price-calculator.service';

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
    private readonly priceCalculatorService: PriceCalculatorService,
  ) {}

  async prepare(dto: ProcessPaymentDto): Promise<PreparedPaymentData> {
    const [acceptanceToken, personalAuthToken] = await Promise.all([
      this.wompiIntegrationService.getAcceptanceToken(),
      this.wompiIntegrationService.getPersonalAuthToken(),
    ]);
    const priceResult = await this.priceCalculatorService.calculateTotal(dto.products);
    const currency = dto.currency || 'COP';
    const adjustedAmount = this.adjustAmount(priceResult.totalInCents, currency);
    return {
      reference: this.generateReference(),
      adjustedAmount,
      currency,
      acceptanceToken,
      personalAuthToken,
    };
  }

  /**
   * Prepare payment data with a pre-calculated amount (calculated server-side)
   * This is the secure method that should be used for production
   */
  async prepareWithCalculatedAmount(
    dto: ProcessPaymentDto,
    calculatedAmountInCents: number,
  ): Promise<PreparedPaymentData> {
    const [acceptanceToken, personalAuthToken] = await Promise.all([
      this.wompiIntegrationService.getAcceptanceToken(),
      this.wompiIntegrationService.getPersonalAuthToken(),
    ]);

    const currency = dto.currency || 'COP';
    return {
      reference: this.generateReference(),
      adjustedAmount: this.adjustAmount(calculatedAmountInCents, currency),
      currency,
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
    // Asegurar que sea entero sin decimales
    const intAmount = Math.floor(amount);

    if (currency === 'COP') {
      // Redondear a múltiplos de 100 para COP (Wompi no acepta centavos)
      const adjusted = Math.round(intAmount / 100) * 100;
      console.log(`[PaymentPreparationService] adjustAmount: input=${amount}, floored=${intAmount}, adjusted=${adjusted}, currency=${currency}`);
      return adjusted;
    }
    console.log(`[PaymentPreparationService] adjustAmount: input=${amount}, floored=${intAmount}, currency=${currency}`);
    return intAmount;
  }
}
