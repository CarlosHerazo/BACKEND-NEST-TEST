import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';
import { Email } from '../../domain/value-objects/email.value-object';

/**
 * Use Case: Get Customer By Email
 * Retrieves a customer by their email address
 */
@Injectable()
export class GetCustomerByEmailUseCase {
  private readonly logger = new Logger(GetCustomerByEmailUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(email: string): Promise<Result<Customer, Error>> {
    this.logger.log(`Retrieving customer with email: ${email}`);

    // Validate email format
    try {
      new Email(email);
    } catch (error) {
      return Result.fail(new Error(error.message));
    }

    return await this.customerRepository.findByEmail(email);
  }
}
