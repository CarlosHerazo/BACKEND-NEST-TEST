import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductUseCase } from './update-product.use-case';
import { IProductRepository } from '../../domain/ports/product.repository.port';
import { PRODUCT_REPOSITORY, Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';
import { UpdateProductDto } from '../dtos/update-product.dto';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let repository: jest.Mocked<IProductRepository>;

  const mockProduct = new Product(
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Product',
    'This is a test product description',
    'https://example.com/image.jpg',
    null, // images
    99.99,
    10,
    null, // category
    null, // rating
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<IProductRepository>> = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    repository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should update a product successfully', async () => {
      const updatedProduct = new Product(
        mockProduct.id,
        'Updated Product',
        mockProduct.description,
        mockProduct.imgUrl,
        null, // images
        149.99,
        mockProduct.stock,
        null, // category
        null, // rating
        mockProduct.createdAt,
        new Date(),
      );

      repository.findById.mockResolvedValue(Result.ok(mockProduct));
      repository.update.mockResolvedValue(Result.ok(updatedProduct));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000', validDto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe('Updated Product');
      expect(result.getValue().price).toBe(149.99);
      expect(repository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(repository.update).toHaveBeenCalled();
    });

    it('should fail if product is not found', async () => {
      repository.findById.mockResolvedValue(Result.fail(new Error('Product not found')));

      const result = await useCase.execute('non-existent-id', validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Product not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should fail if price is negative', async () => {
      const invalidDto = { ...validDto, price: -10 };
      repository.findById.mockResolvedValue(Result.ok(mockProduct));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000', invalidDto);

      expect(result.isFailure).toBe(true);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should fail if repository update fails', async () => {
      repository.findById.mockResolvedValue(Result.ok(mockProduct));
      repository.update.mockResolvedValue(Result.fail(new Error('Update failed')));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000', validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Update failed');
    });
  });
});
