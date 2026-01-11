import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
 type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/transaction.repository.port';

@Injectable()
export class GetTransactionsByEmailUseCase {
  private readonly logger = new Logger(GetTransactionsByEmailUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(customerEmail: string): Promise<Result<Transaction[], Error>> {
    this.logger.log(`Getting transactions for email: ${customerEmail}`);

    const result = await this.transactionRepository.findByCustomerEmail(customerEmail);

    return result.match(
      (transactions) => {
        this.logger.log(`Found ${transactions.length} transactions for email: ${customerEmail}`);
        return Result.ok(transactions);
      },
      (error) => {
        this.logger.error(`Error getting transactions by email: ${error.message}`);
        return Result.fail(error);
      },
    );
  }
}
