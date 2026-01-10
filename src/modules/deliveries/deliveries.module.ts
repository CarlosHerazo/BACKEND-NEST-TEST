import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './infrastructure/http/delivery.controller';
import { DeliveryRepositoryAdapter } from './infrastructure/persistence/delivery.repository.adapter';
import { DeliverySchema } from './infrastructure/persistence/delivery.schema';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { AutoDeliveryService } from './application/services/auto-delivery.service';
import { DELIVERY_REPOSITORY } from './domain/ports/delivery.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySchema])],
  controllers: [DeliveryController],
  providers: [
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryRepositoryAdapter,
    },
    CreateDeliveryUseCase,
    AutoDeliveryService,
  ],
  exports: [AutoDeliveryService],
})
export class DeliveriesModule {}
