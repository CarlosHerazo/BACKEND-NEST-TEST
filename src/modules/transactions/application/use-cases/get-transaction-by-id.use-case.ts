import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/transaction.repository.port';

@Injectable()
export class GetTransactionByIdUseCase {
  private readonly logger = new Logger(GetTransactionByIdUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string): Promise<Result<Transaction, Error>> {
    try {
      this.logger.log(`Retrieving transaction with id: ${id}`);

      const result = await this.transactionRepository.findById(id);

      if (result.isFailure) {
        this.logger.warn(`Transaction not found with id: ${id}`);
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving transaction by id: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to retrieve transaction: ${error.message}`),
      );
    }
  }
}
