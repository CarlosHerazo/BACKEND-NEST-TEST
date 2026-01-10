import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSchema } from './infrastructure/persistence/customer.schema';
import { CustomerController } from './infrastructure/controllers/customer.controller';
import { CUSTOMER_REPOSITORY } from './domain/ports/customer.repository.port';
import { CustomerRepositoryAdapter } from './infrastructure/adapters/customer.repository.adapter';

// Use Cases
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from './application/use-cases/get-customer-by-id.use-case';
import { GetCustomerByEmailUseCase } from './application/use-cases/get-customer-by-email.use-case';
import { GetAllCustomersUseCase } from './application/use-cases/get-all-customers.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case';

/**
 * Customer Module
 * Organizes all customer-related components following Hexagonal Architecture
 */
@Module({
  imports: [TypeOrmModule.forFeature([CustomerSchema])],
  controllers: [CustomerController],
  providers: [
    // Repository
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepositoryAdapter,
    },
    // Use Cases
    CreateCustomerUseCase,
    GetCustomerByIdUseCase,
    GetCustomerByEmailUseCase,
    GetAllCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    GetCustomerByIdUseCase,
    GetCustomerByEmailUseCase,
  ],
})
export class CustomerModule {}
