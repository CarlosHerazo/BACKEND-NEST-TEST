import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';
import { ProductSchema } from '../persistence/product.schema';
import { ProductMapper } from '../persistence/product.mapper';

/**
 * Product Repository Adapter (Implementation)
 * Implements the IProductRepository port using TypeORM
 */
@Injectable()
export class ProductRepositoryAdapter implements IProductRepository {
  private readonly logger = new Logger(ProductRepositoryAdapter.name);

  constructor(
    @InjectRepository(ProductSchema)
    private readonly repository: Repository<ProductSchema>,
  ) {}

  async create(product: Product): Promise<Result<Product, Error>> {
    try {
      const schema = ProductMapper.toSchema(product);
      const saved = await this.repository.save(schema);
      const domain = ProductMapper.toDomain(saved);
      this.logger.log(`Product created: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to create product: ${error.message}`));
    }
  }

  async findById(id: string): Promise<Result<Product, Error>> {
    try {
      const schema = await this.repository.findOne({ where: { id } });
      if (!schema) return Result.fail(new Error(`Product not found with id: ${id}`));
      return Result.ok(ProductMapper.toDomain(schema));
    } catch (error) {
      this.logger.error(`Error finding product by id: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to find product: ${error.message}`));
    }
  }
  async findAll(): Promise<Result<Product[], Error>> {
    try {
      const schemas = await this.repository.find({ order: { createdAt: 'DESC' } });
      const domains = schemas.map(ProductMapper.toDomain);
      return Result.ok(domains);
    } catch (error) {
      this.logger.error(`Error retrieving all products: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to retrieve products: ${error.message}`));
    }
  }


  async update(product: Product): Promise<Result<Product, Error>> {
    try {
      const exists = await this.repository.findOne({ where: { id: product.id } });
      if (!exists) return Result.fail(new Error(`Product not found with id: ${product.id}`));

      const schema = ProductMapper.toSchema(product);
      const updated = await this.repository.save(schema);
      const domain = ProductMapper.toDomain(updated);
      this.logger.log(`Product updated: ${domain.id}`);
      return Result.ok(domain);
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      return Result.fail(new Error(`Failed to update product: ${error.message}`));
    }
  }

}
