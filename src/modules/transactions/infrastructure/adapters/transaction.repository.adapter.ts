import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { TransactionSchema } from '../persistence/transaction.schema';
import { TransactionMapper } from '../persistence/transaction.mapper';

@Injectable()
export class TransactionRepositoryAdapter implements ITransactionRepository {
  private readonly logger = new Logger(TransactionRepositoryAdapter.name);

  constructor(
    @InjectRepository(TransactionSchema)
    private readonly repository: Repository<TransactionSchema>,
  ) {}

  async create(transaction: Transaction): Promise<Result<Transaction, Error>> {
    try {
      const schema = TransactionMapper.toSchema(transaction);
      const saved = await this.repository.save(schema);
      const domain = TransactionMapper.toDomain(saved);
      this.logger.log(`Transaction created: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(
        `Error creating transaction: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to create transaction: ${error.message}`),
      );
    }
  }

  async findById(id: string): Promise<Result<Transaction, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { id } });
      if (!schema) {
        return Result.fail(new Error(`Transaction not found with id: ${id}`));
      }
      const domain = TransactionMapper.toDomain(schema);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(
        `Error finding transaction by id: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to find transaction: ${error.message}`),
      );
    }
  }

  async findByReference(reference: string): Promise<Result<Transaction, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { reference } });
      if (!schema) {
        return Result.fail(new Error(`Transaction not found with reference: ${reference}`));
      }
      const domain = TransactionMapper.toDomain(schema);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(
        `Error finding transaction by reference: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to find transaction: ${error.message}`),
      );
    }
  }

  async findAll(): Promise<Result<Transaction[], Error>> {
    try {
      const schemas = await this.repository.find({
        order: { createdAt: 'DESC' },
      });
      const domains = schemas.map((schema) =>
        TransactionMapper.toDomain(schema),
      );
      return Result.ok(domains);
    } catch (error) {
      this.logger.error(
        `Error finding all transactions: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to find transactions: ${error.message}`),
      );
    }
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<Result<Transaction[], Error>> {
    try {
      const schemas = await this.repository.find({
        where: { customerId },
        order: { createdAt: 'DESC' },
      });
      const domains = schemas.map((schema) =>
        TransactionMapper.toDomain(schema),
      );
      return Result.ok(domains);
    } catch (error) {
      this.logger.error(
        `Error finding transactions by customer id: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to find transactions: ${error.message}`),
      );
    }
  }

  async findByCustomerEmail(
    customerEmail: string,
  ): Promise<Result<Transaction[], Error>> {
    try {
      this.logger.log(`Finding transactions for email: ${customerEmail}`);
      const schemas = await this.repository.find({
        where: { customerEmail },
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Found ${schemas.length} transactions for email: ${customerEmail}`);

      const domains = schemas.map((schema) =>
        TransactionMapper.toDomain(schema),
      );
      return Result.ok(domains);
    } catch (error) {
      this.logger.error(
        `Error finding transactions by customer email: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to find transactions: ${error.message}`),
      );
    }
  }

  async update(transaction: Transaction): Promise<Result<Transaction, Error>> {
    try {
      const schema = TransactionMapper.toSchema(transaction);
      const updated = await this.repository.save(schema);
      const domain = TransactionMapper.toDomain(updated);
      this.logger.log(`Transaction updated: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(
        `Error updating transaction: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to update transaction: ${error.message}`),
      );
    }
  }

  async existsById(id: string): Promise<Result<boolean, Error>> {
    try {
      const count = await this.repository.count({ where: { id } });
      return Result.ok(count > 0);
    } catch (error) {
      this.logger.error(
        `Error checking transaction existence: ${error.message}`,
        error.stack,
      );
      return Result.fail(
        new Error(`Failed to check transaction existence: ${error.message}`),
      );
    }
  }
}
