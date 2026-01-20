import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSchema } from './infrastructure/persistence/product.schema';
import { DiscountCodeSchema } from './infrastructure/persistence/discount-code.schema';
import { ProductController } from './infrastructure/controllers/product.controller';
import { DiscountCodeController } from './infrastructure/controllers/discount-code.controller';

// Use Cases - Products
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';

// Use Cases - Discount Codes
import { CreateDiscountCodeUseCase } from './application/use-cases/create-discount-code.use-case';
import { ValidateDiscountCodeUseCase } from './application/use-cases/validate-discount-code.use-case';
import { GetAllDiscountCodesUseCase } from './application/use-cases/get-all-discount-codes.use-case';

// Repositories
import { PRODUCT_REPOSITORY } from './domain/entities/product.entity';
import { DISCOUNT_CODE_REPOSITORY } from './domain/entities/discount-code.entity';
import { ProductRepositoryAdapter } from './infrastructure/adaptaters/product.repository.adapter';
import { DiscountCodeRepositoryAdapter } from './infrastructure/adaptaters/discount-code.repository.adapter';

// Services
import { StockManagerService } from './application/services/stock-manager.service';

/**
 * Product Module
 * Organizes all product-related components following Hexagonal Architecture
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProductSchema, DiscountCodeSchema])],
  controllers: [ProductController, DiscountCodeController],
  providers: [
    // Repositories
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepositoryAdapter,
    },
    {
      provide: DISCOUNT_CODE_REPOSITORY,
      useClass: DiscountCodeRepositoryAdapter,
    },
    // Use Cases - Products
    CreateProductUseCase,
    GetProductByIdUseCase,
    GetAllProductsUseCase,
    UpdateProductUseCase,
    // Use Cases - Discount Codes
    CreateDiscountCodeUseCase,
    ValidateDiscountCodeUseCase,
    GetAllDiscountCodesUseCase,
    // Services
    StockManagerService,
  ],
  exports: [
    PRODUCT_REPOSITORY,
    DISCOUNT_CODE_REPOSITORY,
    GetProductByIdUseCase,
    StockManagerService,
  ],
})
export class ProductsModule {}
