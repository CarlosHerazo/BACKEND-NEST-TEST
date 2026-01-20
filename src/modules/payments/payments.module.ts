import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { PaymentStatusCheckerService } from './application/services/payment-status-checker.service';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { PaymentPreparationService } from './application/services/payment-preparation.service';
import { PaymentConfirmationService } from './application/services/payment-confirmation.service';
import { PostPaymentOrchestrator } from './application/services/post-payment.orchestrator';
import { PriceCalculatorService } from './application/services/price-calculator.service';

@Module({
  imports: [TransactionsModule, DeliveriesModule, ProductsModule, ConfigModule],
  controllers: [PaymentController],
  providers: [
    ProcessPaymentUseCase,
    PaymentStatusCheckerService,
    PaymentPreparationService,
    PaymentConfirmationService,
    PostPaymentOrchestrator,
    PriceCalculatorService,
  ],
  exports: [PaymentStatusCheckerService],
})
export class PaymentsModule {}
