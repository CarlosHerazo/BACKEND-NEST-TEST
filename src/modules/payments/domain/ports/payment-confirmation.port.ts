import { Transaction } from '../../../transactions/domain/entities/transaction.entity';

export interface IPaymentConfirmationPort {
  confirmAndUpdate(transaction: Transaction): Promise<Transaction>;
}

export const PAYMENT_CONFIRMATION_PORT = Symbol('PAYMENT_CONFIRMATION_PORT');
