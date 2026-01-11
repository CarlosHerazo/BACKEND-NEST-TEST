import { Injectable, Logger, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product.repository.port';
import type { IProductRepository } from '../../domain/ports/product.repository.port';
import { Result } from '../../../../shared/domain/result';

export interface ProductStockItem {
  productId: string;
  quantity: number;
}

@Injectable()
export class StockManagerService {
  private readonly logger = new Logger(StockManagerService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Deduct stock for multiple products
   * Returns Result with success or error if any product fails
   */
  async deductStock(items: ProductStockItem[]): Promise<Result<void, Error>> {
    this.logger.log(`Deducting stock for ${items.length} products`);

    try {
      // 1. Validate all products exist and have sufficient stock
      const validationResults = await Promise.all(
        items.map(item => this.validateProductStock(item)),
      );

      // Check if any validation failed
      for (const result of validationResults) {
        if (result.isFailure) {
          return Result.fail(result.getError());
        }
      }

      // 2. Deduct stock for all products
      const deductionResults = await Promise.all(
        items.map(item => this.deductProductStock(item)),
      );

      // Check if any deduction failed
      for (const result of deductionResults) {
        if (result.isFailure) {
          return Result.fail(result.getError());
        }
      }

      this.logger.log('Stock deducted successfully for all products');
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to deduct stock: ${error.message}`);
      return Result.fail(new Error(`Failed to deduct stock: ${error.message}`));
    }
  }

  /**
   * Validate that a product exists and has sufficient stock
   */
  private async validateProductStock(
    item: ProductStockItem,
  ): Promise<Result<void, Error>> {
    const productResult = await this.productRepository.findById(item.productId);

    return productResult.match(
      (product) => {
        if (product.stock < item.quantity) {
          this.logger.warn(
            `Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
          return Result.fail(
            new Error(
              `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            ),
          );
        }
        return Result.ok(undefined);
      },
      (error) => {
        this.logger.error(`Product not found: ${item.productId}`);
        return Result.fail(new Error(`Product not found: ${item.productId}`));
      },
    );
  }

  /**
   * Deduct stock from a single product
   */
  private async deductProductStock(
    item: ProductStockItem,
  ): Promise<Result<void, Error>> {
    const productResult = await this.productRepository.findById(item.productId);

    return await productResult.match<Promise<Result<void, Error>>>(
      async (product) => {
        const newStock = product.stock - item.quantity;

        this.logger.log(
          `Deducting ${item.quantity} from product ${product.name}. Current: ${product.stock}, New: ${newStock}`,
        );

        const updatedProduct = product.update({ stock: newStock });

        const updateResult = await this.productRepository.update(updatedProduct);

        return updateResult.match(
          () => Result.ok(undefined),
          (error) => Result.fail(error),
        );
      },
      async (error) => Result.fail(error),
    );
  }

  /**
   * Restore stock for products (e.g., when payment fails)
   */
  async restoreStock(items: ProductStockItem[]): Promise<Result<void, Error>> {
    this.logger.log(`Restoring stock for ${items.length} products`);

    try {
      const restoreResults = await Promise.all(
        items.map(item => this.restoreProductStock(item)),
      );

      // Check if any restoration failed
      for (const result of restoreResults) {
        if (result.isFailure) {
          return Result.fail(result.getError());
        }
      }

      this.logger.log('Stock restored successfully for all products');
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(`Failed to restore stock: ${error.message}`);
      return Result.fail(new Error(`Failed to restore stock: ${error.message}`));
    }
  }

  /**
   * Restore stock to a single product
   */
  private async restoreProductStock(
    item: ProductStockItem,
  ): Promise<Result<void, Error>> {
    const productResult = await this.productRepository.findById(item.productId);

    return await productResult.match<Promise<Result<void, Error>>>(
      async (product) => {
        const newStock = product.stock + item.quantity;

        this.logger.log(
          `Restoring ${item.quantity} to product ${product.name}. Current: ${product.stock}, New: ${newStock}`,
        );

        const updatedProduct = product.update({ stock: newStock });

        const updateResult = await this.productRepository.update(updatedProduct);

        return updateResult.match(
          () => Result.ok(undefined),
          (error) => Result.fail(error),
        );
      },
      async (error) => Result.fail(error),
    );
  }
}
