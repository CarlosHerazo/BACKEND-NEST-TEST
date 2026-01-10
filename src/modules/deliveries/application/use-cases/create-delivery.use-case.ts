import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/delivery.entity';
import {
  type IDeliveryRepository,
  DELIVERY_REPOSITORY,
} from '../../domain/ports/delivery.repository.port';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

export interface CreateDeliveryInput {
  transactionId: string;
  customerName: string;
  customerPhone: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
  };
  estimatedDeliveryDate?: Date;
  notes?: string;
}

@Injectable()
export class CreateDeliveryUseCase {
  private readonly logger = new Logger(CreateDeliveryUseCase.name);

  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(input: CreateDeliveryInput): Promise<Result<Delivery, Error>> {
    try {
      this.logger.log(
        `Creating delivery for transaction: ${input.transactionId}`,
      );

      // Check if delivery already exists for this transaction
      const existingDelivery = await this.deliveryRepository.findByTransactionId(
        input.transactionId,
      );

      if (existingDelivery.isSuccess) {
        this.logger.warn(
          `Delivery already exists for transaction ${input.transactionId}`,
        );
        return Result.fail(
          new Error(`Delivery already exists for transaction ${input.transactionId}`),
        );
      }

      // Create new delivery
      const delivery = Delivery.create({
        transactionId: input.transactionId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        address: input.address,
        status: DeliveryStatus.PENDING,
        estimatedDeliveryDate: input.estimatedDeliveryDate,
        notes: input.notes,
      });

      const result = await this.deliveryRepository.create(delivery);

      if (result.isSuccess) {
        this.logger.log(`Delivery created successfully: ${delivery.id}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error creating delivery: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to create delivery: ${error.message}`));
    }
  }
}
