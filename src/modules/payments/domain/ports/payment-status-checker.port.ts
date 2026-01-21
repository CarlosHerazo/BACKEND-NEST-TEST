import { PaymentStatusResponseDto } from '../../application/dtos/payment-status-response.dto';

export interface IPaymentStatusCheckerPort {
  checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  checkPaymentStatusWithRetry(
    paymentId: string,
    maxRetries?: number,
    initialDelayMs?: number,
    useExponentialBackoff?: boolean,
  ): Promise<PaymentStatusResponseDto>;
}

export const PAYMENT_STATUS_CHECKER_PORT = Symbol('PAYMENT_STATUS_CHECKER_PORT');
