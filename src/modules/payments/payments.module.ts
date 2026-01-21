import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { ProductsModule } from '../products/products.module';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';

// Ports
import { PAYMENT_PREPARATION_PORT } from './domain/ports/payment-preparation.port';
import { PAYMENT_STATUS_CHECKER_PORT } from './domain/ports/payment-status-checker.port';
import { PAYMENT_CONFIRMATION_PORT } from './domain/ports/payment-confirmation.port';
import { POST_PAYMENT_PORT } from './domain/ports/post-payment.port';
import { PRICE_CALCULATOR_PORT } from './domain/ports/price-calculator.port';

// Adapters
import { PaymentPreparationAdapter } from './infrastructure/adapters/payment-preparation.adapter';
import { PaymentStatusCheckerAdapter } from './infrastructure/adapters/payment-status-checker.adapter';
import { PaymentConfirmationAdapter } from './infrastructure/adapters/payment-confirmation.adapter';
import { PostPaymentAdapter } from './infrastructure/adapters/post-payment.adapter';
import { PriceCalculatorAdapter } from './infrastructure/adapters/price-calculator.adapter';

@Module({
  imports: [TransactionsModule, DeliveriesModule, ProductsModule, ConfigModule],
  controllers: [PaymentController],
  providers: [
    ProcessPaymentUseCase,
    // Port -> Adapter bindings
    {
      provide: PRICE_CALCULATOR_PORT,
      useClass: PriceCalculatorAdapter,
    },
    {
      provide: PAYMENT_STATUS_CHECKER_PORT,
      useClass: PaymentStatusCheckerAdapter,
    },
    {
      provide: PAYMENT_PREPARATION_PORT,
      useClass: PaymentPreparationAdapter,
    },
    {
      provide: PAYMENT_CONFIRMATION_PORT,
      useClass: PaymentConfirmationAdapter,
    },
    {
      provide: POST_PAYMENT_PORT,
      useClass: PostPaymentAdapter,
    },
  ],
  exports: [PAYMENT_STATUS_CHECKER_PORT],
})
export class PaymentsModule {}
