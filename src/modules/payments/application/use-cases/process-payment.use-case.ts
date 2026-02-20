import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { CreateTransactionUseCase } from '../../../transactions/application/use-cases/create-transaction.use-case';
import { PAYMENT_PREPARATION_PORT } from '../../domain/ports/payment-preparation.port';
import { PAYMENT_CONFIRMATION_PORT } from '../../domain/ports/payment-confirmation.port';
import { POST_PAYMENT_PORT } from '../../domain/ports/post-payment.port';
import { PRICE_CALCULATOR_PORT } from '../../domain/ports/price-calculator.port';
import type { IPaymentPreparationPort, PreparedPaymentData } from '../../domain/ports/payment-preparation.port';
import type { IPaymentConfirmationPort } from '../../domain/ports/payment-confirmation.port';
import type { IPostPaymentPort } from '../../domain/ports/post-payment.port';
import type { IPriceCalculatorPort, PriceCalculationResult } from '../../domain/ports/price-calculator.port';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    @Inject(PAYMENT_PREPARATION_PORT)
    private readonly paymentPreparation: IPaymentPreparationPort,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    @Inject(PAYMENT_CONFIRMATION_PORT)
    private readonly paymentConfirmation: IPaymentConfirmationPort,
    @Inject(POST_PAYMENT_PORT)
    private readonly postPaymentOrchestrator: IPostPaymentPort,
    @Inject(PRICE_CALCULATOR_PORT)
    private readonly priceCalculator: IPriceCalculatorPort,
  ) {}

  async execute(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    try {
      // 1️ Calcular el total de forma segura desde el servidor
      const priceCalculation = await this.priceCalculator.calculateTotal(
        dto.products,
        dto.discountCodeId,
      );

      // 2️ Preparar datos del pago (usando el total calculado en el servidor)
      const preparedData = await this.paymentPreparation.prepareWithCalculatedAmount(
        dto,
        priceCalculation.totalInCents,
      );


      
      // 3️ Crear transacción en base de datos y enviar payload a Wompi
      const transaction = await this.createTransaction(dto, preparedData, priceCalculation);

      // 4️ Confirmar estado del pago
      const confirmedTransaction = await this.paymentConfirmation.confirmAndUpdate(transaction);

      // 5️ Acciones post-aprobación (actualizar inventario)
      await this.postPaymentOrchestrator.handle(confirmedTransaction, dto.products);

      // 6️ Construir respuesta
      return this.buildResponse(confirmedTransaction, priceCalculation);
    } catch (error) {
      throw new BadRequestException(`Failed to process payment: ${error.message}`);
    }
  }

  private async createTransaction(
    dto: ProcessPaymentDto,
    preparedData: PreparedPaymentData,
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
