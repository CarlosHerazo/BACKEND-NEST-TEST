import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { WompiApiClient } from '../transactions/infrastructure/clients/wompi-api.client';
import { PaymentStatusCheckerService } from './application/services/payment-status-checker.service';

@Module({
  imports: [TransactionsModule, DeliveriesModule, ProductsModule, ConfigModule],
  controllers: [PaymentController],
  providers: [WompiApiClient, PaymentStatusCheckerService],
  exports: [PaymentStatusCheckerService],
})
export class PaymentsModule {}
