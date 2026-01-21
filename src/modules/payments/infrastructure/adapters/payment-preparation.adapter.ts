import { Injectable, Inject } from '@nestjs/common';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';
import { PRICE_CALCULATOR_PORT } from '../../domain/ports/price-calculator.port';
import type {
  IPaymentPreparationPort,
  PreparedPaymentData,
} from '../../domain/ports/payment-preparation.port';
import type { IPriceCalculatorPort } from '../../domain/ports/price-calculator.port';

@Injectable()
export class PaymentPreparationAdapter implements IPaymentPreparationPort {
  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
    @Inject(PRICE_CALCULATOR_PORT)
    private readonly priceCalculator: IPriceCalculatorPort,
  ) {}

  async prepare(dto: ProcessPaymentDto): Promise<PreparedPaymentData> {
    const [acceptanceToken, personalAuthToken] = await Promise.all([
      this.wompiIntegrationService.getAcceptanceToken(),
      this.wompiIntegrationService.getPersonalAuthToken(),
    ]);
    const priceResult = await this.priceCalculator.calculateTotal(dto.products);
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
    const intAmount = Math.floor(amount);

    if (currency === 'COP') {
      const adjusted = Math.round(intAmount / 100) * 100;
      console.log(
        `[PaymentPreparationAdapter] adjustAmount: input=${amount}, floored=${intAmount}, adjusted=${adjusted}, currency=${currency}`,
      );
      return adjusted;
    }
    console.log(
      `[PaymentPreparationAdapter] adjustAmount: input=${amount}, floored=${intAmount}, currency=${currency}`,
    );
    return intAmount;
  }
}
