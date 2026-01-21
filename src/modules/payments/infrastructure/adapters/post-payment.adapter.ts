import { Injectable, Logger } from '@nestjs/common';
import { AutoDeliveryService } from '../../../deliveries/application/services/auto-delivery.service';
import { StockManagerService } from '../../../products/application/services/stock-manager.service';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { IPostPaymentPort, ProductItem } from '../../domain/ports/post-payment.port';

@Injectable()
export class PostPaymentAdapter implements IPostPaymentPort {
  private readonly logger = new Logger(PostPaymentAdapter.name);

  constructor(
    private readonly autoDeliveryService: AutoDeliveryService,
    private readonly stockManagerService: StockManagerService,
  ) {}

  async handle(transaction: Transaction, products: ProductItem[]): Promise<void> {
    if (transaction.status !== TransactionStatus.APPROVED) {
      return;
    }

    try {
      await this.deductStock(products);
      await this.createDelivery(transaction);
    } catch (error) {
      this.logger.error(
        `Post-payment handling failed for transaction ${transaction.id}`,
        error.stack,
      );
      throw error;
    }
  }

  private async deductStock(products: ProductItem[]): Promise<void> {
    await this.stockManagerService.deductStock(
      products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
    );
  }

  private async createDelivery(transaction: Transaction): Promise<void> {
    await this.autoDeliveryService.createDeliveryForTransaction(transaction);
  }
}
