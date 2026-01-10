import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/delivery.entity';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';
import { DeliverySchema } from './delivery.schema';
import { DeliveryMapper } from './delivery.mapper';

@Injectable()
export class DeliveryRepositoryAdapter implements IDeliveryRepository {
  private readonly logger = new Logger(DeliveryRepositoryAdapter.name);

  constructor(
    @InjectRepository(DeliverySchema)
    private readonly repository: Repository<DeliverySchema>,
  ) {}

  async create(delivery: Delivery): Promise<Result<Delivery, Error>> {
    try {
      const schema = DeliveryMapper.toSchema(delivery);
      const saved = await this.repository.save(schema);
      const domain = DeliveryMapper.toDomain(saved);
      this.logger.log(`Delivery created: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error creating delivery: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to create delivery: ${error.message}`));
    }
  }

  async findById(id: string): Promise<Result<Delivery, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { id } });

      if (!schema) {
        return Result.fail(new Error(`Delivery with id ${id} not found`));
      }

      const delivery = DeliveryMapper.toDomain(schema);
      return Result.ok(delivery);
    } catch (error) {
      this.logger.error(`Error finding delivery by id: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to find delivery: ${error.message}`));
    }
  }

  async findByTransactionId(transactionId: string): Promise<Result<Delivery, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { transactionId } });

      if (!schema) {
        return Result.fail(
          new Error(`Delivery for transaction ${transactionId} not found`),
        );
      }

      const delivery = DeliveryMapper.toDomain(schema);
      return Result.ok(delivery);
    } catch (error) {
      this.logger.error(
        `Error finding delivery by transaction id: ${error.message}`,
        error.stack,
      );
      return Result.fail(new Error(`Failed to find delivery: ${error.message}`));
    }
  }

  async update(delivery: Delivery): Promise<Result<Delivery, Error>> {
    try {
      const schema = DeliveryMapper.toSchema(delivery);
      const saved = await this.repository.save(schema);
      const domain = DeliveryMapper.toDomain(saved);
      this.logger.log(`Delivery updated: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error updating delivery: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to update delivery: ${error.message}`));
    }
  }
}
