import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../../../shared/domain/result';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let createProductUseCase: jest.Mocked<CreateProductUseCase>;
  let getProductByIdUseCase: jest.Mocked<GetProductByIdUseCase>;
  let getAllProductsUseCase: jest.Mocked<GetAllProductsUseCase>;
  let updateProductUseCase: jest.Mocked<UpdateProductUseCase>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockProduct = new Product(
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Product',
    'A test product description',
    'https://example.com/image.jpg',
    ['https://example.com/img1.jpg'],
    99.99,
    100,
    'Electronics',
    4.5,
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: CreateProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetProductByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetAllProductsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateProductUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    createProductUseCase = module.get(CreateProductUseCase);
    getProductByIdUseCase = module.get(GetProductByIdUseCase);
    getAllProductsUseCase = module.get(GetAllProductsUseCase);
    updateProductUseCase = module.get(UpdateProductUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    const createDto: CreateProductDto = {
      name: 'Test Product',
      description: 'A test product description',
      imgUrl: 'https://example.com/image.jpg',
      price: 99.99,
      stock: 100,
    };

    it('should create a product successfully', async () => {
      createProductUseCase.execute.mockResolvedValue(Result.ok(mockProduct));

      const result = await controller.createProduct(createDto);

      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.name);
      expect(createProductUseCase.execute).toHaveBeenCalledWith(createDto);
    });

    it('should throw error when creation fails', async () => {
      createProductUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Product creation failed')),
      );

      await expect(controller.createProduct(createDto)).rejects.toThrow('Product creation failed');
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      getProductByIdUseCase.execute.mockResolvedValue(Result.ok(mockProduct));

      const result = await controller.getProductById(mockProduct.id);

      expect(result.id).toBe(mockProduct.id);
      expect(getProductByIdUseCase.execute).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw error when product not found', async () => {
      getProductByIdUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      await expect(controller.getProductById('non-existent-id')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      getAllProductsUseCase.execute.mockResolvedValue(Result.ok([mockProduct]));

      const result = await controller.getAllProducts();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockProduct.id);
    });

    it('should return empty array when no products', async () => {
      getAllProductsUseCase.execute.mockResolvedValue(Result.ok([]));

      const result = await controller.getAllProducts();

      expect(result).toHaveLength(0);
    });

    it('should throw error on failure', async () => {
      getAllProductsUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Failed to get products')),
      );

      await expect(controller.getAllProducts()).rejects.toThrow('Failed to get products');
    });
  });

  describe('updateProduct', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should update a product successfully', async () => {
      const updatedProduct = mockProduct.update(updateDto);
      updateProductUseCase.execute.mockResolvedValue(Result.ok(updatedProduct));

      const result = await controller.updateProduct(mockProduct.id, updateDto);

      expect(result.id).toBe(mockProduct.id);
      expect(updateProductUseCase.execute).toHaveBeenCalledWith(mockProduct.id, updateDto);
    });

    it('should throw error when product not found for update', async () => {
      updateProductUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Product not found')),
      );

      await expect(controller.updateProduct('non-existent-id', updateDto)).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
