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

      const saveResult = await this.transactionRepository.create(transaction);

      if (saveResult.isFailure) {
        return saveResult;
      }

      try {
        const wompiResult = await this.wompiIntegrationService.createTransaction(dto);

        const updatedTransaction = transaction.updateStatus(
          transaction.status,
          wompiResult.wompiTransactionId,
          wompiResult.redirectUrl,
          wompiResult.paymentLinkId,
        );

        const updateResult = await this.transactionRepository.update(updatedTransaction);

        if (updateResult.isSuccess) {
          this.logger.log(
            `Transaction ${transactionId} created successfully with Wompi ID: ${wompiResult.wompiTransactionId}`,
          );
        }

        return updateResult;
      } catch (wompiError) {
        this.logger.error(
          `Error creating transaction in Wompi: ${wompiError.message}`,
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
