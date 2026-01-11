import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSchema } from './infrastructure/persistence/product.schema';
import { ProductController } from './infrastructure/controllers/product.controller';


// Use Cases
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { PRODUCT_REPOSITORY } from './domain/entities/product.entity';
import { ProductRepositoryAdapter } from './infrastructure/adaptaters/product.repository.adapter';
import { StockManagerService } from './application/services/stock-manager.service';

/**
 * Product Module
 * Organizes all product-related components following Hexagonal Architecture
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProductSchema])],
  controllers: [ProductController],
  providers: [
    // Repository
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepositoryAdapter,
    },
    // Use Cases
    CreateProductUseCase,
    GetProductByIdUseCase,
    GetAllProductsUseCase,
    UpdateProductUseCase,
    // Services
    StockManagerService,
  ],
  exports: [
    PRODUCT_REPOSITORY,
    GetProductByIdUseCase,
    StockManagerService,
  ],
})
export class ProductsModule {}
