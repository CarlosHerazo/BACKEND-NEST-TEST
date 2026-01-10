import { Test, TestingModule } from '@nestjs/testing';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { PRODUCT_REPOSITORY, Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let repository: jest.Mocked<IProductRepository>;

  const mockProduct = new Product(
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Product',
    'This is a test product description',
    'https://example.com/image.jpg',
    99.99,
    10,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<IProductRepository>> = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductByIdUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
    repository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should retrieve a product by id successfully', async () => {
      repository.findById.mockResolvedValue(Result.ok(mockProduct));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(repository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should fail if id is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Product ID is required');
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should fail if product is not found', async () => {
      repository.findById.mockResolvedValue(Result.fail(new Error('Product not found')));

      const result = await useCase.execute('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Product not found');
    });
  });
});
