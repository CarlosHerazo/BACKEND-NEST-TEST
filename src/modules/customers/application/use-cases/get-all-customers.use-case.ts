import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';

/**
 * Use Case: Get All Customers
 * Retrieves all customers from the system
 */
@Injectable()
export class GetAllCustomersUseCase {
  private readonly logger = new Logger(GetAllCustomersUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(): Promise<Result<Customer[], Error>> {
    this.logger.log('Retrieving all customers');
    return await this.customerRepository.findAll();
  }
}
