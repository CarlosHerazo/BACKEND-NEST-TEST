import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/transaction.repository.port';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { WompiIntegrationService } from '../services/wompi-integration.service';

@Injectable()
export class CreateTransactionUseCase {
  private readonly logger = new Logger(CreateTransactionUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    private readonly wompiIntegrationService: WompiIntegrationService,
  ) {}

  async execute(
    dto: CreateTransactionDto,
  ): Promise<Result<Transaction, Error>> {
    try {
      const transactionId = randomUUID();

      const transaction = Transaction.create(
        transactionId,
        dto.customerId,
        dto.customerEmail,
        dto.amountInCents,
        dto.currency || 'COP',
        dto.reference,
        dto.acceptanceToken,
        dto.acceptPersonalAuth,
        dto.paymentMethod,
        dto.customerFullName,
        dto.customerPhoneNumber,
        dto.shippingAddress,
        dto.metadata,
      );

      this.logger.log(
        `Creating transaction ${transactionId} for customer ${dto.customerId}`,
      );

      // Log transaction details
      this.logger.debug(
        `Transaction details: ${JSON.stringify({
          id: transactionId,
          customerId: dto.customerId,
          email: dto.customerEmail,
          amount: dto.amountInCents,
          currency: dto.currency,
          reference: dto.reference,
          paymentMethod: dto.paymentMethod?.type,
        }, null, 2)}`,
      );

      const saveResult = await this.transactionRepository.create(transaction);
      this.logger.log(
        `Transaction ${transactionId} saved to repository with result: ${saveResult}.`,
      );

      if (saveResult.isFailure) {
        return saveResult;
      }

      try {
        this.logger.log(
          `Sending transaction to Wompi: ${transactionId}`,
        );

        const wompiResult = await this.wompiIntegrationService.createTransaction(dto);

        this.logger.debug(
          `Wompi result received: ${JSON.stringify({
            wompiTransactionId: wompiResult.wompiTransactionId,
            hasRedirectUrl: !!wompiResult.redirectUrl,
            hasPaymentLinkId: !!wompiResult.paymentLinkId,
          })}`,
        );

        const updatedTransaction = transaction.updateStatus(
          transaction.status,
          wompiResult.wompiTransactionId,
          wompiResult.redirectUrl,
          wompiResult.paymentLinkId,
        );

        const updateResult = await this.transactionRepository.update(updatedTransaction);
        this.logger.log(
          `Wompi update for transaction ${updateResult}.`,
        );
        if (updateResult.isSuccess) {
          this.logger.log(
            `Transaction ${transactionId} created successfully with Wompi ID: ${wompiResult.wompiTransactionId}`,
          );
        }

        return updateResult;
      } catch (wompiError) {
        this.logger.error(
          `Error creating transaction in Wompi for ${transactionId}`,
        );
        this.logger.error(
          `Wompi error message: ${wompiError.message}`,
        );
        this.logger.error(
          `Wompi error stack: ${wompiError.stack}`,
        );
        this.logger.error(
          `Transaction data that failed: ${JSON.stringify({
            id: transactionId,
            reference: dto.reference,
            amount: dto.amountInCents,
            email: dto.customerEmail,
          })}`,
        );

        return Result.fail(
          new Error(`Failed to create transaction in Wompi: ${wompiError.message}`),
        );
      }
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to create transaction: ${error.message}`));
    }
  }
}
