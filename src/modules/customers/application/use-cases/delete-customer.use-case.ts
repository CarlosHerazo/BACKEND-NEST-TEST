import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Result } from '../../../../shared/domain/result';

/**
 * Use Case: Delete Customer
 * Deletes a customer from the system
 */
@Injectable()
export class DeleteCustomerUseCase {
  private readonly logger = new Logger(DeleteCustomerUseCase.name);

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Result<void, Error>> {
    this.logger.log(`Deleting customer with id: ${id}`);

    if (!id || id.trim() === '') {
      return Result.fail(new Error('Customer ID is required'));
    }

    return await this.customerRepository.delete(id);
  }
}
