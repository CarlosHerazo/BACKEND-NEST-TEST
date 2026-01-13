import { Injectable, Inject } from '@nestjs/common';
import { PaymentStatusCheckerService } from './payment-status-checker.service';
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from '../../../transactions/domain/ports/transaction.repository.port';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

@Injectable()
export class PaymentConfirmationService {
  constructor(
    private readonly paymentStatusChecker: PaymentStatusCheckerService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async confirmAndUpdate(transaction: Transaction): Promise<Transaction> {
    if (!transaction.wompiTransactionId) {
      return transaction;
    }

    const statusCheck =
      await this.paymentStatusChecker.checkPaymentStatusWithRetry(
        transaction.wompiTransactionId,
        5,
        2000,
        true,
      );

    if (!statusCheck.success) {
      return transaction;
    }

    const transactionStatus = this.mapPaymentStatusToTransactionStatus(
      statusCheck.status,
    );

    const updatedTransaction = transaction.updateStatus(
      transactionStatus,
      transaction.wompiTransactionId,
      transaction.redirectUrl,
      transaction.paymentLinkId,
    );

    const updateResult =
      await this.transactionRepository.update(updatedTransaction);

    return updateResult.isSuccess ? updateResult.getValue() : transaction;
  }

  private mapPaymentStatusToTransactionStatus(
    paymentStatus: PaymentStatus,
  ): TransactionStatus {
    const map: Record<PaymentStatus, TransactionStatus> = {
      [PaymentStatus.PENDING]: TransactionStatus.PENDING,
      [PaymentStatus.APPROVED]: TransactionStatus.APPROVED,
      [PaymentStatus.DECLINED]: TransactionStatus.DECLINED,
      [PaymentStatus.VOIDED]: TransactionStatus.VOIDED,
      [PaymentStatus.ERROR]: TransactionStatus.ERROR,
    };

    return map[paymentStatus] ?? TransactionStatus.ERROR;
  }
}
