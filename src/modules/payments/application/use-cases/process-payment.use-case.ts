import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { CreateTransactionUseCase } from '../../../transactions/application/use-cases/create-transaction.use-case';
import { PaymentPreparationService } from '../services/payment-preparation.service';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import { PostPaymentOrchestrator } from '../services/post-payment.orchestrator';
import { PriceCalculatorService, PriceCalculationResult } from '../services/price-calculator.service';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    private readonly paymentPreparation: PaymentPreparationService,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly paymentConfirmation: PaymentConfirmationService,
    private readonly postPaymentOrchestrator: PostPaymentOrchestrator,
    private readonly priceCalculator: PriceCalculatorService,
  ) {}

  async execute(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    try {
      // 1️⃣ Calcular el total de forma segura desde el servidor
      this.logger.log('Calculating secure total from product prices...');
      const priceCalculation = await this.priceCalculator.calculateTotal(
        dto.products,
        dto.discountCodeId,
      );

      this.logger.log(
        `Secure price calculation: subtotal=${priceCalculation.subtotalInCents}, ` +
        `discount=${priceCalculation.discountInCents}, total=${priceCalculation.totalInCents}`,
      );

      // 2️⃣ Preparar datos del pago (usando el total calculado en el servidor)
      const preparedData = await this.paymentPreparation.prepareWithCalculatedAmount(
        dto,
        priceCalculation.totalInCents,
      );

      this.logger.log(
        `Amount adjustment: originalTotal=${priceCalculation.totalInCents}, ` +
        `adjustedAmount=${preparedData.adjustedAmount}, currency=${preparedData.currency}`,
      );

      // 3️⃣ Crear transacción
      const transaction = await this.createTransaction(dto, preparedData, priceCalculation);

      // 4️⃣ Confirmar estado del pago
      const confirmedTransaction =
        await this.paymentConfirmation.confirmAndUpdate(transaction);

      // 5️⃣ Acciones post-aprobación
      await this.postPaymentOrchestrator.handle(confirmedTransaction, dto.products);

      // 6️⃣ Construir respuesta
      return this.buildResponse(confirmedTransaction, priceCalculation);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(`Failed to process payment: ${error.message}`);
    }
  }

  private async createTransaction(
    dto: ProcessPaymentDto,
    preparedData: { reference: string; adjustedAmount: number; currency: string; acceptanceToken: string; personalAuthToken: string },
    priceCalculation: PriceCalculationResult,
  ): Promise<Transaction> {
    const createTransactionDto = {
      ...dto,
      amountInCents: preparedData.adjustedAmount,
      currency: preparedData.currency,
      reference: preparedData.reference,
      acceptanceToken: preparedData.acceptanceToken,
      acceptPersonalAuth: preparedData.personalAuthToken,
      metadata: {
        ...dto.metadata,
        priceBreakdown: {
          subtotalInCents: priceCalculation.subtotalInCents,
          discountInCents: priceCalculation.discountInCents,
          totalInCents: priceCalculation.totalInCents,
          discountCode: priceCalculation.discountCode?.code,
          items: priceCalculation.items,
        },
      },
    };

    const result = await this.createTransactionUseCase.execute(createTransactionDto);

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    return result.getValue();
  }

  private buildResponse(
    transaction: Transaction,
    priceCalculation: PriceCalculationResult,
  ): PaymentResponseDto {
    return {
      transactionId: transaction.id,
      wompiTransactionId: transaction.wompiTransactionId || '',
      reference: transaction.reference,
      status: transaction.status,
      redirectUrl: transaction.redirectUrl || null,
      paymentLinkId: transaction.paymentLinkId || null,
      priceBreakdown: {
        subtotalInCents: priceCalculation.subtotalInCents,
        discountInCents: priceCalculation.discountInCents,
        totalInCents: priceCalculation.totalInCents,
        discountCode: priceCalculation.discountCode?.code,
      },
      info: {
        message: 'Payment processed successfully',
        nextStep:
          transaction.status === TransactionStatus.APPROVED
            ? 'Payment approved and completed'
            : 'Payment is being processed',
      },
      createdAt: transaction.createdAt,
    };
  }
}
