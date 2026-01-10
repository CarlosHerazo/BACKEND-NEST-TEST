import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from './create-product.use-case';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { PRODUCT_REPOSITORY, Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';
import { CreateProductDto } from '../dtos/create-product.dto';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
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
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    repository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDto: CreateProductDto = {
      name: 'Test Product',
      description: 'This is a test product description',
      imgUrl: 'https://example.com/image.jpg',
      price: 99.99,
      stock: 10,
    };

    it('should create a product successfully', async () => {
      repository.create.mockResolvedValue(Result.ok(mockProduct));

      const result = await useCase.execute(validDto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe('Test Product');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should fail if price is negative', async () => {
      const invalidDto = { ...validDto, price: -10 };

      const result = await useCase.execute(invalidDto);

      expect(result.isFailure).toBe(true);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should fail if repository create fails', async () => {
      repository.create.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });
  });
});
