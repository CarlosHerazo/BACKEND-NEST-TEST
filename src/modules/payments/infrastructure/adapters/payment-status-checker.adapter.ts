import { Injectable, Logger } from '@nestjs/common';
import { WompiApiClient } from '../../../transactions/infrastructure/clients/wompi-api.client';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentStatusResponseDto } from '../../application/dtos/payment-status-response.dto';
import { IPaymentStatusCheckerPort } from '../../domain/ports/payment-status-checker.port';

@Injectable()
export class PaymentStatusCheckerAdapter implements IPaymentStatusCheckerPort {
  private readonly logger = new Logger(PaymentStatusCheckerAdapter.name);

  constructor(private readonly wompiApiClient: WompiApiClient) {}

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

  async checkPaymentStatus(
    paymentId: string,
  ): Promise<PaymentStatusResponseDto> {
    try {
      this.logger.log(`Checking payment status for: ${paymentId}`);

      const response = await this.wompiApiClient.checkPaymentStatus(paymentId);

      this.logger.debug(
        `Raw response from Wompi: ${JSON.stringify(response, null, 2)}`,
      );

      if (response.success && response.data?.status) {
        const mappedStatus = this.mapProviderStatusToGeneric(
          response.data.status,
        );

        this.logger.log(
          `Payment ${paymentId} status: ${response.data.status} -> ${mappedStatus}`,
        );

        if (
          mappedStatus === PaymentStatus.ERROR ||
          mappedStatus === PaymentStatus.DECLINED
        ) {
          this.logger.warn(
            `Payment ${paymentId} failed. Status message: ${response.data.status_message || 'N/A'}`,
          );
          this.logger.warn(
            `Payment error details: ${JSON.stringify(
              {
                status: response.data.status,
                status_message: response.data.status_message,
                payment_method_type: response.data.payment_method_type,
                payment_method: response.data.payment_method,
              },
              null,
              2,
            )}`,
          );
        }

        return new PaymentStatusResponseDto(
          true,
          mappedStatus,
          paymentId,
          JSON.stringify(response.data),
        );
      }

      this.logger.warn(
        `Failed to retrieve payment status for ${paymentId}. Response: ${JSON.stringify(response)}`,
      );

      return new PaymentStatusResponseDto(
        false,
        PaymentStatus.ERROR,
        paymentId,
        JSON.stringify(response),
      );
    } catch (error) {
      this.logger.error(
        `Error checking payment status for ${paymentId}: ${error.message}`,
      );
      this.logger.error(`Error stack: ${error.stack}`);

      return new PaymentStatusResponseDto(
        false,
        PaymentStatus.ERROR,
        paymentId,
        '',
      );
    }
  }

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

      if (
        lastResponse.success &&
        lastResponse.status !== PaymentStatus.PENDING
      ) {
        this.logger.log(
          `Payment status resolved to ${lastResponse.status} after ${attempt} attempt(s)`,
        );
        return lastResponse;
      }

      if (attempt < maxRetries) {
        const delay = useExponentialBackoff
          ? initialDelayMs * Math.pow(2, attempt - 1)
          : initialDelayMs;

        this.logger.log(
          `Payment still ${lastResponse?.status || 'pending'}. Waiting ${delay}ms before next check...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.logger.warn(
      `Payment status check completed after ${maxRetries} attempts. Final status: ${lastResponse?.status || 'unknown'}`,
    );

    return (
      lastResponse ||
      new PaymentStatusResponseDto(false, PaymentStatus.ERROR, paymentId, '')
    );
  }
}
