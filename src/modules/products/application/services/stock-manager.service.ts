import { Injectable, Logger, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY} from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';
import type { IProductRepository } from '../../domain/ports/product.repository.port';

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
   * Stock para multiple productos
   * Retorna resultado exitoso o error si falla alguna validación o actualización
   */
  async deductStock(items: ProductStockItem[]): Promise<Result<void, Error>> {
    this.logger.log(`Deducting stock for ${items.length} products`);

    try {
      // 1.Valida si los productos existen y tienen stock suficiente
      const validationResults = await Promise.all(
        items.map(item => this.validateProductStock(item)),
      );

      // Verifica si alguna validación falló
      for (const result of validationResults) {
        if (result.isFailure) {
          return Result.fail(result.getError());
        }
      }

      // 2. Deduce el stock de cada producto
      const deductionResults = await Promise.all(
        items.map(item => this.deductProductStock(item)),
      );

      // Verifica si alguna deducción falló
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
   * Valida el stock de un solo producto
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
   * Deduce el stock de un solo producto
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
   * Restaura el stock para múltiples productos
   */
  async restoreStock(items: ProductStockItem[]): Promise<Result<void, Error>> {
    this.logger.log(`Restoring stock for ${items.length} products`);

    try {
      const restoreResults = await Promise.all(
        items.map(item => this.restoreProductStock(item)),
      );

      // Verifica si alguna restauración falló
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
   * Restaura el stock de un solo producto
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
