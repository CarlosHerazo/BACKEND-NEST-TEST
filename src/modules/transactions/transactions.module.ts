import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransactionSchema } from './infrastructure/persistence/transaction.schema';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { WompiTokensController } from './infrastructure/controllers/wompi-tokens.controller';
import { TransactionRepositoryAdapter } from './infrastructure/adapters/transaction.repository.adapter';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository.port';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from './application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionStatusUseCase } from './application/use-cases/update-transaction-status.use-case';
import { GetTransactionsByEmailUseCase } from './application/use-cases/get-transactions-by-email.use-case';
import { WompiApiClient } from './infrastructure/clients/wompi-api.client';
import { WompiIntegrationService } from './application/services/wompi-integration.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionSchema]), ConfigModule],
  controllers: [TransactionController, WompiTokensController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepositoryAdapter,
    },
    WompiApiClient,
    WompiIntegrationService,
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionStatusUseCase,
    GetTransactionsByEmailUseCase,
  ],
  exports: [
    TRANSACTION_REPOSITORY,
    CreateTransactionUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionStatusUseCase,
    WompiIntegrationService,
  ],
})
export class TransactionsModule {}
