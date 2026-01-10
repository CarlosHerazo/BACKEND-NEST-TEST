import { Injectable, Logger } from '@nestjs/common';
import { WompiApiClient } from '../../../transactions/infrastructure/clients/wompi-api.client';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentStatusResponseDto } from '../dtos/payment-status-response.dto';

@Injectable()
export class PaymentStatusCheckerService {
  private readonly logger = new Logger(PaymentStatusCheckerService.name);

  constructor(private readonly wompiApiClient: WompiApiClient) {}

  /**
   * Maps Wompi status to generic payment status
   */
  private mapProviderStatusToGeneric(wompiStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      APPROVED: PaymentStatus.APPROVED,
      DECLINED: PaymentStatus.DECLINED,
      VOIDED: PaymentStatus.VOIDED,
      ERROR: PaymentStatus.ERROR,
      PENDING: PaymentStatus.PENDING,
    };

    return statusMap[wompiStatus] || PaymentStatus.ERROR;
  }

  /**
   * Check payment status from provider
   * This allows checking status without waiting for webhooks
   */
  async checkPaymentStatus(
    paymentId: string,
  ): Promise<PaymentStatusResponseDto> {
    try {
      this.logger.log(`Checking payment status for: ${paymentId}`);

      const response = await this.wompiApiClient.checkPaymentStatus(paymentId);

      if (response.success && response.data?.status) {
        const mappedStatus = this.mapProviderStatusToGeneric(
          response.data.status,
        );

        this.logger.log(
          `Payment ${paymentId} status: ${response.data.status} -> ${mappedStatus}`,
        );

        return new PaymentStatusResponseDto(
          true,
          mappedStatus,
          paymentId,
          JSON.stringify(response.data),
        );
      }

      this.logger.warn(
        `Failed to retrieve payment status for ${paymentId}`,
      );

      return new PaymentStatusResponseDto(
        false,
        PaymentStatus.ERROR,
        paymentId,
        '',
      );
    } catch (error) {
      this.logger.error(
        `Error checking payment status: ${error.message}`,
        error.stack,
      );

      return new PaymentStatusResponseDto(
        false,
        PaymentStatus.ERROR,
        paymentId,
        '',
      );
    }
  }

  /**
   * Polls payment status with retry logic
   * Useful for checking status immediately after payment creation
   * Uses exponential backoff for better handling of delayed responses
   */
  async checkPaymentStatusWithRetry(
    paymentId: string,
    maxRetries: number = 5,
    initialDelayMs: number = 2000,
    useExponentialBackoff: boolean = true,
  ): Promise<PaymentStatusResponseDto> {
    let lastResponse: PaymentStatusResponseDto | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this.logger.log(
        `Checking payment status (attempt ${attempt}/${maxRetries})`,
      );

      lastResponse = await this.checkPaymentStatus(paymentId);

      // If we got a definitive status (not pending), return immediately
      if (
        lastResponse.success &&
        lastResponse.status !== PaymentStatus.PENDING
      ) {
        this.logger.log(
          `Payment status resolved to ${lastResponse.status} after ${attempt} attempt(s)`,
        );
        return lastResponse;
      }

      // Wait before next retry (except on last attempt)
      if (attempt < maxRetries) {
        const delay = useExponentialBackoff
          ? initialDelayMs * Math.pow(2, attempt - 1) // Exponential: 2s, 4s, 8s, 16s...
          : initialDelayMs; // Fixed delay

        this.logger.log(
          `Payment still ${lastResponse?.status || 'pending'}. Waiting ${delay}ms before next check...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.logger.warn(
      `Payment status check completed after ${maxRetries} attempts. Final status: ${lastResponse?.status || 'unknown'}`,
    );

    // Return last response after all retries
    return (
      lastResponse ||
      new PaymentStatusResponseDto(false, PaymentStatus.ERROR, paymentId, '')
    );
  }
}
