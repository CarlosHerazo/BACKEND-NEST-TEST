import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/transaction.repository.port';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';

@Injectable()
export class UpdateTransactionStatusUseCase {
  private readonly logger = new Logger(UpdateTransactionStatusUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    reference: string,
    dto: UpdateTransactionDto,
  ): Promise<Result<Transaction, Error>> {
    try {
      this.logger.log(`Updating transaction ${reference} to status ${dto.status}`);

      const transactionResult = await this.transactionRepository.findByReference(reference);

      if (transactionResult.isFailure) {
        this.logger.warn(`Transaction not found with reference: ${reference}`);
        return Result.fail(transactionResult.getError());
      }

      const transaction = transactionResult.getValue();

      if (transaction.isFinal()) {
        this.logger.warn(
          `Cannot update transaction ${reference} - already in final status: ${transaction.status}`,
        );
        return Result.fail(
          new Error(
            `Transaction is in final status ${transaction.status} and cannot be updated`,
          ),
        );
      }

      const updatedTransaction = transaction.updateStatus(
        dto.status,
        dto.wompiTransactionId,
        undefined,
        undefined,
        dto.metadata,
        dto.errorMessage,
      );

      const updateResult =
        await this.transactionRepository.update(updatedTransaction);

      if (updateResult.isSuccess) {
        this.logger.log(
          `Transaction ${reference} updated successfully to status ${dto.status}`,
        );
      }

      return updateResult;
    } catch (error) {
      this.logger.error(
        `Error updating transaction status: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to update transaction: ${error.message}`),
      );
    }
  }
}
