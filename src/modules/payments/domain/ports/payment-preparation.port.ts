import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';

export interface PreparedPaymentData {
  reference: string;
  adjustedAmount: number;
  currency: string;
  acceptanceToken: string;
  personalAuthToken: string;
}

export interface IPaymentPreparationPort {
  prepare(dto: ProcessPaymentDto): Promise<PreparedPaymentData>;
  prepareWithCalculatedAmount(
    dto: ProcessPaymentDto,
    calculatedAmountInCents: number,
  ): Promise<PreparedPaymentData>;
}

export const PAYMENT_PREPARATION_PORT = Symbol('PAYMENT_PREPARATION_PORT');
