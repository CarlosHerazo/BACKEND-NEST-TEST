import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';
import { CustomerSchema } from '../persistence/customer.schema';
import { CustomerMapper } from '../persistence/customer.mapper';

/**
 * Customer Repository Adapter (Implementation)
 * Implements the ICustomerRepository port using TypeORM
 */
@Injectable()
export class CustomerRepositoryAdapter implements ICustomerRepository {
  private readonly logger = new Logger(CustomerRepositoryAdapter.name);

  constructor(
    @InjectRepository(CustomerSchema)
    private readonly repository: Repository<CustomerSchema>,
  ) {}

  async create(customer: Customer): Promise<Result<Customer, Error>> {
    try {
      const schema = CustomerMapper.toSchema(customer);
      const saved = await this.repository.save(schema);
      const domain = CustomerMapper.toDomain(saved);
      this.logger.log(`Customer created: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error creating customer: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to create customer: ${error.message}`));
    }
  }

  async findById(id: string): Promise<Result<Customer, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { id } });
      if (!schema) {
        return Result.fail(new Error(`Customer not found with id: ${id}`));
      }
      const domain = CustomerMapper.toDomain(schema);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error finding customer by id: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to find customer: ${error.message}`));
    }
  }

  async findByEmail(email: string): Promise<Result<Customer, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { email } });
      if (!schema) {
        return Result.fail(new Error(`Customer not found with email: ${email}`));
      }
      const domain = CustomerMapper.toDomain(schema);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error finding customer by email: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to find customer: ${error.message}`));
    }
  }

  async findAll(): Promise<Result<Customer[], Error>> {
    try {
      const schemas = await this.repository.find({
        order: { createdAt: 'DESC' },
      });
      const domains = schemas.map(CustomerMapper.toDomain);
      return Result.ok(domains);
    } catch (error) {
      this.logger.error(`Error finding all customers: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to retrieve customers: ${error.message}`));
    }
  }

  async update(customer: Customer): Promise<Result<Customer, Error>> {
    try {
      const exists = await this.repository.findOne({ where: { id: customer.id } });
      if (!exists) {
        return Result.fail(new Error(`Customer not found with id: ${customer.id}`));
      }

      const schema = CustomerMapper.toSchema(customer);
      const updated = await this.repository.save(schema);
      const domain = CustomerMapper.toDomain(updated);
      this.logger.log(`Customer updated: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error updating customer: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to update customer: ${error.message}`));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        return Result.fail(new Error(`Customer not found with id: ${id}`));
      }
      this.logger.log(`Customer deleted: ${id}`);
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(`Error deleting customer: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to delete customer: ${error.message}`));
    }
  }

  async existsByEmail(email: string): Promise<Result<boolean, Error>> {
    try {
      const count = await this.repository.count({ where: { email } });
      return Result.ok(count > 0);
    } catch (error) {
      this.logger.error(`Error checking customer existence: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to check customer existence: ${error.message}`));
    }
  }
}
