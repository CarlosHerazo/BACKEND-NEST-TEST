import { PriceCalculatorAdapter } from './price-calculator.adapter';
import { DiscountCode } from '../../../products/domain/entities/discount-code.entity';
import { Result } from '../../../../shared/domain/result';

describe('PriceCalculatorAdapter', () => {
  let adapter: PriceCalculatorAdapter;

  const mockProductRepository = {
    findById: jest.fn(),
  };

  const mockDiscountCodeRepository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    adapter = new PriceCalculatorAdapter(
      mockProductRepository as any,
      mockDiscountCodeRepository as any,
    );
  });

  describe('calculateTotal', () => {
    it('should calculate total without discount', async () => {
      const product = {
        id: 'prod-1',
        name: 'Mouse Ergonómico',
        price: 399999,
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));

      const result = await adapter.calculateTotal([
        { productId: 'prod-1', quantity: 1 },
      ]);

      expect(result.subtotalInCents).toBe(399999);
      expect(result.discountInCents).toBe(0);
      expect(result.totalInCents).toBe(475998); // Math.floor(399999 * 1.19) = 475998
      expect(result.items).toHaveLength(1);
      expect(result.items[0].unitPriceInCents).toBe(399999);
    });

    it('should calculate total with 10% discount - no decimals', async () => {
      const product = {
        id: 'prod-1',
        name: 'Mouse Ergonómico',
        price: 400000,
        stock: 10,
      };

      const discountCode = DiscountCode.create({
        id: 'discount-1',
        code: 'SAVE10',
        discountPercentage: 10,
      });

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));
      mockDiscountCodeRepository.findById.mockResolvedValue(Result.ok(discountCode));

      const result = await adapter.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      expect(result.subtotalInCents).toBe(400000);
      expect(result.discountInCents).toBe(40000);
      expect(result.totalInCents).toBe(428400); // Math.floor((400000 - 40000) * 1.19) = 428400
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle 10% discount on price that would create decimals - uses Math.floor', async () => {
      const product = {
        id: 'prod-1',
        name: 'Mouse Ergonómico',
        price: 399999,
        stock: 10,
      };

      const discountCode = DiscountCode.create({
        id: 'discount-1',
        code: 'SAVE10',
        discountPercentage: 10,
      });

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));
      mockDiscountCodeRepository.findById.mockResolvedValue(Result.ok(discountCode));

      const result = await adapter.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      expect(result.discountInCents).toBe(39999);
      expect(result.totalInCents).toBe(428400); // Math.floor((399999 - 39999) * 1.19) = Math.floor(360000 * 1.19) = 428400
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle 15% discount correctly', async () => {
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 399999,
        stock: 10,
      };

      const discountCode = DiscountCode.create({
        id: 'discount-1',
        code: 'SAVE15',
        discountPercentage: 15,
      });

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));
      mockDiscountCodeRepository.findById.mockResolvedValue(Result.ok(discountCode));

      const result = await adapter.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      expect(result.discountInCents).toBe(59999);
      expect(result.totalInCents).toBe(404600); // Math.floor((399999 - 59999) * 1.19) = Math.floor(340000 * 1.19) = 404600
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle multiple products with discount', async () => {
      const product1 = { id: 'prod-1', name: 'Product 1', price: 100000, stock: 10 };
      const product2 = { id: 'prod-2', name: 'Product 2', price: 50000, stock: 10 };

      const discountCode = DiscountCode.create({
        id: 'discount-1',
        code: 'SAVE20',
        discountPercentage: 20,
      });

      mockProductRepository.findById
        .mockResolvedValueOnce(Result.ok(product1))
        .mockResolvedValueOnce(Result.ok(product2));
      mockDiscountCodeRepository.findById.mockResolvedValue(Result.ok(discountCode));

      const result = await adapter.calculateTotal(
        [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
        'discount-1',
      );

      expect(result.subtotalInCents).toBe(250000);
      expect(result.discountInCents).toBe(50000);
      expect(result.totalInCents).toBe(238000); // Math.floor((250000 - 50000) * 1.19) = Math.floor(200000 * 1.19) = 238000
    });

    it('should throw error when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      await expect(
        adapter.calculateTotal([{ productId: 'non-existent', quantity: 1 }]),
      ).rejects.toThrow('Product not found: non-existent');
    });

    it('should throw error when insufficient stock', async () => {
      const product = {
        id: 'prod-1',
        name: 'Low Stock Product',
        price: 10000,
        stock: 2,
      };

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));

      await expect(
        adapter.calculateTotal([{ productId: 'prod-1', quantity: 5 }]),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should ignore invalid discount code', async () => {
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100000,
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.fail(new Error('Discount code not found')),
      );

      const result = await adapter.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'invalid-discount',
      );

      expect(result.subtotalInCents).toBe(100000);
      expect(result.discountInCents).toBe(0);
      expect(result.totalInCents).toBe(119000); // Math.floor(100000 * 1.19) = 119000
      expect(result.discountCode).toBeUndefined();
    });

    it('should floor product price if it has decimals', async () => {
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 399999.99,
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(Result.ok(product));

      const result = await adapter.calculateTotal([
        { productId: 'prod-1', quantity: 1 },
      ]);

      expect(result.items[0].unitPriceInCents).toBe(399999);
      expect(result.totalInCents).toBe(475998); // Math.floor(399999 * 1.19) = 475998
    });
  });
});

describe('DiscountCode.calculateDiscount', () => {
  it('should return integer discount using Math.floor', () => {
    const discountCode = DiscountCode.create({
      id: '1',
      code: 'TEST10',
      discountPercentage: 10,
    });

    const discount = discountCode.calculateDiscount(399999);
    expect(discount).toBe(39999);
    expect(Number.isInteger(discount)).toBe(true);
  });

  it('should return integer discount for 15%', () => {
    const discountCode = DiscountCode.create({
      id: '1',
      code: 'TEST15',
      discountPercentage: 15,
    });

    const discount = discountCode.calculateDiscount(399999);
    expect(discount).toBe(59999);
    expect(Number.isInteger(discount)).toBe(true);
  });

  it('should return exact discount when no decimals', () => {
    const discountCode = DiscountCode.create({
      id: '1',
      code: 'TEST10',
      discountPercentage: 10,
    });

    const discount = discountCode.calculateDiscount(400000);
    expect(discount).toBe(40000);
  });
});
