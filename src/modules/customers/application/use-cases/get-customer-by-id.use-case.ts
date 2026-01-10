import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';

/**
 * Use Case: Get Customer By ID
 * Retrieves a customer by their unique identifier
 */
@Injectable()
export class GetCustomerByIdUseCase {
  private readonly logger = new Logger(GetCustomerByIdUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Result<Customer, Error>> {
    this.logger.log(`Retrieving customer with id: ${id}`);

    if (!id || id.trim() === '') {
      return Result.fail(new Error('Customer ID is required'));
    }

    return await this.customerRepository.findById(id);
  }
}
