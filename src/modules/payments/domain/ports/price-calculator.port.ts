import { DiscountCode } from '../../../products/domain/entities/discount-code.entity';

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

export interface IPriceCalculatorPort {
  calculateTotal(
    products: ProductItem[],
    discountCodeId?: string,
  ): Promise<PriceCalculationResult>;
}

export const PRICE_CALCULATOR_PORT = Symbol('PRICE_CALCULATOR_PORT');
