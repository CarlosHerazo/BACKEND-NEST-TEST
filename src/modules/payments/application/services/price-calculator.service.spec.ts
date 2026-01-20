import { PriceCalculatorService } from './price-calculator.service';
import { DiscountCode } from '../../../products/domain/entities/discount-code.entity';
import { Result } from '../../../../shared/domain/result';

describe('PriceCalculatorService', () => {
  let service: PriceCalculatorService;

  const mockProductRepository = {
    findById: jest.fn(),
  };

  const mockDiscountCodeRepository = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new PriceCalculatorService(
      mockProductRepository as any,
      mockDiscountCodeRepository as any,
    );
  });

  describe('calculateTotal', () => {
    it('should calculate total without discount', async () => {
      // Arrange
      const product = {
        id: 'prod-1',
        name: 'Mouse Ergonómico',
        price: 399999,
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );

      // Act
      const result = await service.calculateTotal([
        { productId: 'prod-1', quantity: 1 },
      ]);

      // Assert
      expect(result.subtotalInCents).toBe(399999);
      expect(result.discountInCents).toBe(0);
      expect(result.totalInCents).toBe(399999);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].unitPriceInCents).toBe(399999);
    });

    it('should calculate total with 10% discount - no decimals', async () => {
      // Arrange
      const product = {
        id: 'prod-1',
        name: 'Mouse Ergonómico',
        price: 400000, // Precio que da un número entero con 10%
        stock: 10,
      };

      const discountCode = DiscountCode.create({
        id: 'discount-1',
        code: 'SAVE10',
        discountPercentage: 10,
      });

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.ok(discountCode),
      );

      // Act
      const result = await service.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      // Assert
      expect(result.subtotalInCents).toBe(400000);
      expect(result.discountInCents).toBe(40000); // 10% de 400000
      expect(result.totalInCents).toBe(360000);
      // Verificar que no hay decimales
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle 10% discount on price that would create decimals - uses Math.floor', async () => {
      // Arrange: 399999 * 0.10 = 39999.9 -> Math.floor = 39999
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

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.ok(discountCode),
      );

      // Act
      const result = await service.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      // Assert
      // 399999 * 0.10 = 39999.9 -> Math.floor = 39999
      expect(result.discountInCents).toBe(39999);
      // 399999 - 39999 = 360000
      expect(result.totalInCents).toBe(360000);
      // Verificar que el total es un entero
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle 15% discount correctly', async () => {
      // Arrange: 399999 * 0.15 = 59999.85 -> Math.floor = 59999
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

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.ok(discountCode),
      );

      // Act
      const result = await service.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'discount-1',
      );

      // Assert
      expect(result.discountInCents).toBe(59999); // Math.floor(399999 * 0.15)
      expect(result.totalInCents).toBe(340000); // 399999 - 59999
      expect(Number.isInteger(result.totalInCents)).toBe(true);
    });

    it('should handle multiple products with discount', async () => {
      // Arrange
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
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.ok(discountCode),
      );

      // Act
      const result = await service.calculateTotal(
        [
          { productId: 'prod-1', quantity: 2 }, // 200000
          { productId: 'prod-2', quantity: 1 }, // 50000
        ],
        'discount-1',
      );

      // Assert
      expect(result.subtotalInCents).toBe(250000); // 200000 + 50000
      expect(result.discountInCents).toBe(50000); // 20% de 250000
      expect(result.totalInCents).toBe(200000); // 250000 - 50000
    });

    it('should throw error when product not found', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      // Act & Assert
      await expect(
        service.calculateTotal([{ productId: 'non-existent', quantity: 1 }]),
      ).rejects.toThrow('Product not found: non-existent');
    });

    it('should throw error when insufficient stock', async () => {
      // Arrange
      const product = {
        id: 'prod-1',
        name: 'Low Stock Product',
        price: 10000,
        stock: 2,
      };

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );

      // Act & Assert
      await expect(
        service.calculateTotal([{ productId: 'prod-1', quantity: 5 }]),
      ).rejects.toThrow('Insufficient stock');
    });

    it('should ignore invalid discount code', async () => {
      // Arrange
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100000,
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );
      mockDiscountCodeRepository.findById.mockResolvedValue(
        Result.fail(new Error('Discount code not found')),
      );

      // Act
      const result = await service.calculateTotal(
        [{ productId: 'prod-1', quantity: 1 }],
        'invalid-discount',
      );

      // Assert
      expect(result.subtotalInCents).toBe(100000);
      expect(result.discountInCents).toBe(0);
      expect(result.totalInCents).toBe(100000);
      expect(result.discountCode).toBeUndefined();
    });

    it('should floor product price if it has decimals', async () => {
      // Arrange: simulating a product with decimal price (shouldn't happen but defensive)
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        price: 399999.99, // This should be floored to 399999
        stock: 10,
      };

      mockProductRepository.findById.mockResolvedValue(
        Result.ok(product),
      );

      // Act
      const result = await service.calculateTotal([
        { productId: 'prod-1', quantity: 1 },
      ]);

      // Assert
      expect(result.items[0].unitPriceInCents).toBe(399999);
      expect(result.totalInCents).toBe(399999);
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

    // 399999 * 0.10 = 39999.9 -> should floor to 39999
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

    // 399999 * 0.15 = 59999.85 -> should floor to 59999
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

    // 400000 * 0.10 = 40000 -> exact, no floor needed
    const discount = discountCode.calculateDiscount(400000);
    expect(discount).toBe(40000);
  });
});
