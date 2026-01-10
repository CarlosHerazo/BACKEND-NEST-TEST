import { Injectable, Logger } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../use-cases/create-delivery.use-case';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';

@Injectable()
export class AutoDeliveryService {
  private readonly logger = new Logger(AutoDeliveryService.name);

  constructor(private readonly createDeliveryUseCase: CreateDeliveryUseCase) {}

  /**
   * Automatically creates a delivery when a transaction is approved
   * Returns the created delivery ID or null if creation failed/skipped
   */
  async createDeliveryForTransaction(
    transaction: Transaction,
  ): Promise<string | null> {
    try {
      // Only create delivery for approved transactions
      if (transaction.status !== TransactionStatus.APPROVED) {
        this.logger.log(
          `Skipping delivery creation for transaction ${transaction.id} - status is ${transaction.status}`,
        );
        return null;
      }

      // Validate required data
      if (!transaction.shippingAddress) {
        this.logger.warn(
          `Cannot create delivery for transaction ${transaction.id} - missing shipping address`,
        );
        return null;
      }

      if (!transaction.customerFullName) {
        this.logger.warn(
          `Cannot create delivery for transaction ${transaction.id} - missing customer name`,
        );
        return null;
      }

      if (!transaction.customerPhoneNumber) {
        this.logger.warn(
          `Cannot create delivery for transaction ${transaction.id} - missing customer phone`,
        );
        return null;
      }

      this.logger.log(
        `Creating delivery for approved transaction: ${transaction.id}`,
      );

      // Calculate estimated delivery date (7 days from now)
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

      const result = await this.createDeliveryUseCase.execute({
        transactionId: transaction.id,
        customerName: transaction.customerFullName,
        customerPhone: transaction.customerPhoneNumber,
        address: {
          addressLine1: transaction.shippingAddress.addressLine1,
          addressLine2: transaction.shippingAddress.addressLine2,
          city: transaction.shippingAddress.city,
          region: transaction.shippingAddress.region,
          country: transaction.shippingAddress.country,
          postalCode: transaction.shippingAddress.postalCode,
        },
        estimatedDeliveryDate,
        notes: `Auto-generated delivery for transaction ${transaction.reference}`,
      });

      if (result.isSuccess) {
        const delivery = result.getValue();
        this.logger.log(
          `Delivery ${delivery.id} created automatically for transaction ${transaction.id}`,
        );
        return delivery.id;
      } else {
        const error = result.getError();
        this.logger.error(
          `Failed to create delivery for transaction ${transaction.id}: ${error.message}`,
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Error creating delivery for transaction ${transaction.id}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
