import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { CreateTransactionUseCase } from '../../../transactions/application/use-cases/create-transaction.use-case';
import { PaymentPreparationService } from '../services/payment-preparation.service';
import { PaymentConfirmationService } from '../services/payment-confirmation.service';
import { PostPaymentOrchestrator } from '../services/post-payment.orchestrator';
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
  ) {}

  async execute(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    try {
      // 1️⃣ Preparar datos del pago
      const preparedData = await this.paymentPreparation.prepare(dto);

      // 2️⃣ Crear transacción
      const transaction = await this.createTransaction(dto, preparedData);

      // 3️⃣ Confirmar estado del pago
      const confirmedTransaction =
        await this.paymentConfirmation.confirmAndUpdate(transaction);

      // 4️⃣ Acciones post-aprobación
      await this.postPaymentOrchestrator.handle(confirmedTransaction, dto.products);

      // 5️⃣ Construir respuesta
      return this.buildResponse(confirmedTransaction);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(`Failed to process payment: ${error.message}`);
    }
  }

  private async createTransaction(
    dto: ProcessPaymentDto,
    preparedData: { reference: string; adjustedAmount: number; currency: string; acceptanceToken: string; personalAuthToken: string },
  ): Promise<Transaction> {
    const createTransactionDto = {
      ...dto,
      amountInCents: preparedData.adjustedAmount,
      currency: preparedData.currency,
      reference: preparedData.reference,
      acceptanceToken: preparedData.acceptanceToken,
      acceptPersonalAuth: preparedData.personalAuthToken,
    };

    const result = await this.createTransactionUseCase.execute(createTransactionDto);

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    return result.getValue();
  }

  private buildResponse(transaction: Transaction): PaymentResponseDto {
    return {
      transactionId: transaction.id,
      wompiTransactionId: transaction.wompiTransactionId || '',
      reference: transaction.reference,
      status: transaction.status,
      redirectUrl: transaction.redirectUrl || null,
      paymentLinkId: transaction.paymentLinkId || null,
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
