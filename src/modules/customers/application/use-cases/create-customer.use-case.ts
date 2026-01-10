import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';

/**
 * Use Case: Create Customer
 * Handles the business logic for creating a new customer
 */
@Injectable()
export class CreateCustomerUseCase {
  private readonly logger = new Logger(CreateCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<Result<Customer, Error>> {
    this.logger.log(`Creating customer with email: ${dto.email}`);

    // Validate email format using value object
    try {
      new Email(dto.email);
    } catch (error) {
      return Result.fail(new Error(error.message));
    }

    // Validate phone format using value object
    try {
      new Phone(dto.phone);
    } catch (error) {
      return Result.fail(new Error(error.message));
    }

    // Check if customer already exists
    const existsResult = await this.customerRepository.existsByEmail(dto.email);
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    if (existsResult.getValue()) {
      return Result.fail(new Error(`Customer with email ${dto.email} already exists`));
    }

    // Create customer entity
    const customer = Customer.create(
      randomUUID(),
      dto.email,
      dto.fullName,
      dto.phone,
      dto.address,
      dto.city,
      dto.country,
      dto.postalCode,
    );

    // Persist customer
    return await this.customerRepository.create(customer);
  }
}
