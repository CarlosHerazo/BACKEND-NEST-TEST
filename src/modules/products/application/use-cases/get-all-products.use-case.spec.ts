import { Test, TestingModule } from '@nestjs/testing';
import { GetAllProductsUseCase } from './get-all-products.use-case';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { PRODUCT_REPOSITORY, Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  let repository: jest.Mocked<IProductRepository>;

  const mockProducts = [
    new Product(
      '123e4567-e89b-12d3-a456-426614174000',
      'Product 1',
      'Description 1',
      'https://example.com/image1.jpg',
      99.99,
      10,
      new Date(),
      new Date(),
    ),
    new Product(
      '123e4567-e89b-12d3-a456-426614174001',
      'Product 2',
      'Description 2',
      'https://example.com/image2.jpg',
      49.99,
      5,
      new Date(),
      new Date(),
    ),
  ];

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<IProductRepository>> = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllProductsUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllProductsUseCase>(GetAllProductsUseCase);
    repository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should retrieve all products successfully', async () => {
      repository.findAll.mockResolvedValue(Result.ok(mockProducts));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(2);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should return empty array if no products exist', async () => {
      repository.findAll.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should fail if repository fails', async () => {
      repository.findAll.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });
  });
});
