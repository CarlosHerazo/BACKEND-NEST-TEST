import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDiscountCodeRepository } from '../../domain/ports/discount-code.repository.port';
import { DiscountCode } from '../../domain/entities/discount-code.entity';
import { Result } from '../../../../shared/domain/result';
import { DiscountCodeSchema } from '../persistence/discount-code.schema';
import { DiscountCodeMapper } from '../persistence/discount-code.mapper';

@Injectable()
export class DiscountCodeRepositoryAdapter implements IDiscountCodeRepository {
  private readonly logger = new Logger(DiscountCodeRepositoryAdapter.name);

  constructor(
    @InjectRepository(DiscountCodeSchema)
    private readonly repository: Repository<DiscountCodeSchema>,
  ) {}

  async create(discountCode: DiscountCode): Promise<Result<DiscountCode, Error>> {
    try {
      const schema = DiscountCodeMapper.toSchema(discountCode);
      const saved = await this.repository.save(schema);
      this.logger.log(`Discount code created: ${saved.code}`);
      return Result.ok(DiscountCodeMapper.toDomain(saved));
    } catch (error) {
      this.logger.error(`Failed to create discount code: ${error.message}`);
      return Result.fail(new Error(`Failed to create discount code: ${error.message}`));
    }
  }

  async findById(id: string): Promise<Result<DiscountCode, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { id } });
      if (!schema) {
        return Result.fail(new Error(`Discount code not found with id: ${id}`));
      }
      return Result.ok(DiscountCodeMapper.toDomain(schema));
    } catch (error) {
      this.logger.error(`Failed to find discount code: ${error.message}`);
      return Result.fail(new Error(`Failed to find discount code: ${error.message}`));
    }
  }

  async findByCode(code: string): Promise<Result<DiscountCode, Error>> {
    try {
      const schema = await this.repository.findOne({
        where: { code: code.toUpperCase() }
      });
      if (!schema) {
        return Result.fail(new Error(`Discount code not found: ${code}`));
      }
      return Result.ok(DiscountCodeMapper.toDomain(schema));
    } catch (error) {
      this.logger.error(`Failed to find discount code: ${error.message}`);
      return Result.fail(new Error(`Failed to find discount code: ${error.message}`));
    }
  }

  async findAll(): Promise<Result<DiscountCode[], Error>> {
    try {
      const schemas = await this.repository.find({ order: { createdAt: 'DESC' } });
      return Result.ok(schemas.map(DiscountCodeMapper.toDomain));
    } catch (error) {
      this.logger.error(`Failed to retrieve discount codes: ${error.message}`);
      return Result.fail(new Error(`Failed to retrieve discount codes: ${error.message}`));
    }
  }

  async update(discountCode: DiscountCode): Promise<Result<DiscountCode, Error>> {
    try {
      const schema = DiscountCodeMapper.toSchema(discountCode);
      const saved = await this.repository.save(schema);
      this.logger.log(`Discount code updated: ${saved.code}`);
      return Result.ok(DiscountCodeMapper.toDomain(saved));
    } catch (error) {
      this.logger.error(`Failed to update discount code: ${error.message}`);
      return Result.fail(new Error(`Failed to update discount code: ${error.message}`));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        return Result.fail(new Error(`Discount code not found with id: ${id}`));
      }
      this.logger.log(`Discount code deleted: ${id}`);
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to delete discount code: ${error.message}`);
      return Result.fail(new Error(`Failed to delete discount code: ${error.message}`));
    }
  }
}
