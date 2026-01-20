import { Injectable, Inject, Logger } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../../products/domain/entities/product.entity';
import { DISCOUNT_CODE_REPOSITORY, DiscountCode } from '../../../products/domain/entities/discount-code.entity';
import type { IProductRepository } from '../../../products/domain/ports/product.repository.port';
import type { IDiscountCodeRepository } from '../../../products/domain/ports/discount-code.repository.port';

export interface ProductItem {
  productId: string;
  quantity: number;
}

export interface PriceCalculationResult {
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
  discountCode?: DiscountCode;
  items: {
    productId: string;
    productName: string;
    unitPriceInCents: number;
    quantity: number;
    lineTotalInCents: number;
  }[];
}

@Injectable()
export class PriceCalculatorService {
  private readonly logger = new Logger(PriceCalculatorService.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(DISCOUNT_CODE_REPOSITORY)
    private readonly discountCodeRepository: IDiscountCodeRepository,
  ) {}

  async calculateTotal(
    products: ProductItem[],
    discountCodeId?: string,
  ): Promise<PriceCalculationResult> {
    this.logger.log(`Calculating total for ${products.length} products`);

    const items: PriceCalculationResult['items'] = [];
    let subtotalInCents = 0;

    for (const item of products) {
      const productResult = await this.productRepository.findById(item.productId);

      if (productResult.isFailure) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = productResult.getValue();

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }

      // El precio ya está en centavos en la DB, redondear para evitar decimales
      const unitPriceInCents = Math.floor(product.price);
      const lineTotalInCents = unitPriceInCents * item.quantity;

      items.push({
        productId: product.id,
        productName: product.name,
        unitPriceInCents,
        quantity: item.quantity,
        lineTotalInCents,
      });

      subtotalInCents += lineTotalInCents;
    }

    let discountInCents = 0;
    let discountCode: DiscountCode | undefined;

    if (discountCodeId) {
      const discountResult = await this.discountCodeRepository.findById(discountCodeId);

      if (discountResult.isSuccess) {
        discountCode = discountResult.getValue();
        discountInCents = discountCode.calculateDiscount(subtotalInCents);
        this.logger.log(
          `Applied discount code "${discountCode.code}" (${discountCode.discountPercentage}%): -${discountInCents} cents`,
        );
      } else {
        this.logger.warn(`Discount code not found: ${discountCodeId}`);
      }
    }

    const totalInCents = subtotalInCents - discountInCents;

    this.logger.log(
      `Price calculation complete: subtotal=${subtotalInCents}, discount=${discountInCents}, total=${totalInCents}`,
    );

    return {
      subtotalInCents,
      discountInCents,
      totalInCents,
      discountCode,
      items,
    };
  }
}
