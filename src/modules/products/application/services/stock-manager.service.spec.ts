import { Test, TestingModule } from '@nestjs/testing';
import { StockManagerService, ProductStockItem } from './stock-manager.service';
import { PRODUCT_REPOSITORY } from '../../domain/entities/product.entity';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';

describe('StockManagerService', () => {
  let service: StockManagerService;
  let productRepository: jest.Mocked<any>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const createMockProduct = (id: string, name: string, stock: number): Product => {
    return new Product(
      id,
      name,
      'Description',
      'https://example.com/img.jpg',
      null,
      100,
      stock,
      'Electronics',
      4.5,
      mockDate,
      mockDate,
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockManagerService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockManagerService>(StockManagerService);
    productRepository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deductStock', () => {
    it('should deduct stock for a single product', async () => {
      const product = createMockProduct('product-1', 'Test Product', 10);
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 3 }];

      productRepository.findById.mockResolvedValue(Result.ok(product));
      productRepository.update.mockResolvedValue(Result.ok(product.update({ stock: 7 })));

      const result = await service.deductStock(items);

      expect(result.isSuccess).toBe(true);
      expect(productRepository.findById).toHaveBeenCalledWith('product-1');
      expect(productRepository.update).toHaveBeenCalled();
    });

    it('should deduct stock for multiple products', async () => {
      const product1 = createMockProduct('product-1', 'Product 1', 10);
      const product2 = createMockProduct('product-2', 'Product 2', 20);
      const items: ProductStockItem[] = [
        { productId: 'product-1', quantity: 3 },
        { productId: 'product-2', quantity: 5 },
      ];

      productRepository.findById
        .mockResolvedValueOnce(Result.ok(product1))
        .mockResolvedValueOnce(Result.ok(product2))
        .mockResolvedValueOnce(Result.ok(product1))
        .mockResolvedValueOnce(Result.ok(product2));

      productRepository.update
        .mockResolvedValueOnce(Result.ok(product1.update({ stock: 7 })))
        .mockResolvedValueOnce(Result.ok(product2.update({ stock: 15 })));

      const result = await service.deductStock(items);

      expect(result.isSuccess).toBe(true);
    });

    it('should fail when product not found', async () => {
      const items: ProductStockItem[] = [{ productId: 'non-existent', quantity: 1 }];

      productRepository.findById.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      const result = await service.deductStock(items);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Product not found');
    });

    it('should fail when insufficient stock', async () => {
      const product = createMockProduct('product-1', 'Test Product', 5);
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 10 }];

      productRepository.findById.mockResolvedValue(Result.ok(product));

      const result = await service.deductStock(items);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Insufficient stock');
    });

    it('should fail when update fails', async () => {
      const product = createMockProduct('product-1', 'Test Product', 10);
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 3 }];

      productRepository.findById.mockResolvedValue(Result.ok(product));
      productRepository.update.mockResolvedValue(Result.fail(new Error('Update failed')));

      const result = await service.deductStock(items);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Update failed');
    });

    it('should handle empty items array', async () => {
      const result = await service.deductStock([]);

      expect(result.isSuccess).toBe(true);
    });

    it('should fail when repository throws exception', async () => {
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 1 }];

      productRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.deductStock(items);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to deduct stock');
    });
  });

  describe('restoreStock', () => {
    it('should restore stock for a single product', async () => {
      const product = createMockProduct('product-1', 'Test Product', 5);
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 3 }];

      productRepository.findById.mockResolvedValue(Result.ok(product));
      productRepository.update.mockResolvedValue(Result.ok(product.update({ stock: 8 })));

      const result = await service.restoreStock(items);

      expect(result.isSuccess).toBe(true);
      expect(productRepository.findById).toHaveBeenCalledWith('product-1');
      expect(productRepository.update).toHaveBeenCalled();
    });

    it('should restore stock for multiple products', async () => {
      const product1 = createMockProduct('product-1', 'Product 1', 5);
      const product2 = createMockProduct('product-2', 'Product 2', 10);
      const items: ProductStockItem[] = [
        { productId: 'product-1', quantity: 3 },
        { productId: 'product-2', quantity: 5 },
      ];

      productRepository.findById
        .mockResolvedValueOnce(Result.ok(product1))
        .mockResolvedValueOnce(Result.ok(product2));

      productRepository.update
        .mockResolvedValueOnce(Result.ok(product1.update({ stock: 8 })))
        .mockResolvedValueOnce(Result.ok(product2.update({ stock: 15 })));

      const result = await service.restoreStock(items);

      expect(result.isSuccess).toBe(true);
    });

    it('should fail when product not found during restore', async () => {
      const items: ProductStockItem[] = [{ productId: 'non-existent', quantity: 1 }];

      productRepository.findById.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      const result = await service.restoreStock(items);

      expect(result.isFailure).toBe(true);
    });

    it('should fail when update fails during restore', async () => {
      const product = createMockProduct('product-1', 'Test Product', 5);
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 3 }];

      productRepository.findById.mockResolvedValue(Result.ok(product));
      productRepository.update.mockResolvedValue(Result.fail(new Error('Update failed')));

      const result = await service.restoreStock(items);

      expect(result.isFailure).toBe(true);
    });

    it('should handle empty items array during restore', async () => {
      const result = await service.restoreStock([]);

      expect(result.isSuccess).toBe(true);
    });

    it('should fail when repository throws exception during restore', async () => {
      const items: ProductStockItem[] = [{ productId: 'product-1', quantity: 1 }];

      productRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.restoreStock(items);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to restore stock');
    });
  });
});
