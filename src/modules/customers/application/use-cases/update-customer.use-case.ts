import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';

/**
 * Use Case: Update Customer
 * Updates an existing customer's information
 */
@Injectable()
export class UpdateCustomerUseCase {
  private readonly logger = new Logger(UpdateCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<Result<Customer, Error>> {
    this.logger.log(`Updating customer with id: ${id}`);

    // Validate email if provided
    if (dto.email) {
      try {
        new Email(dto.email);
      } catch (error) {
        return Result.fail(new Error(error.message));
      }
    }

    // Validate phone if provided
    if (dto.phone) {
      try {
        new Phone(dto.phone);
      } catch (error) {
        return Result.fail(new Error(error.message));
      }
    }

    // Find existing customer
    const customerResult = await this.customerRepository.findById(id);
    if (customerResult.isFailure) {
      return Result.fail(customerResult.getError());
    }

    const existingCustomer = customerResult.getValue();

    // Check if email is being changed and if it's already in use
    if (dto.email && dto.email !== existingCustomer.email) {
      const emailExistsResult = await this.customerRepository.existsByEmail(dto.email);
      if (emailExistsResult.isFailure) {
        return Result.fail(emailExistsResult.getError());
      }
      if (emailExistsResult.getValue()) {
        return Result.fail(
          new Error(`Customer with email ${dto.email} already exists`),
        );
      }
    }

    // Update customer
    const updatedCustomer = existingCustomer.update(dto);

    // Persist changes
    return await this.customerRepository.update(updatedCustomer);
  }
}
