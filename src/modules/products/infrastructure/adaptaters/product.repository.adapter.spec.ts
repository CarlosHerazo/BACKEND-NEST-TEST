import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryAdapter } from './product.repository.adapter';
import { ProductSchema } from '../persistence/product.schema';
import { Product } from '../../domain/entities/product.entity';

describe('ProductRepositoryAdapter', () => {
  let adapter: ProductRepositoryAdapter;
  let repository: jest.Mocked<Repository<ProductSchema>>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockProductSchema: ProductSchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'A test product description',
    imgUrl: 'https://example.com/image.jpg',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    price: 99.99,
    stock: 100,
    category: 'Electronics',
    rating: 4.5,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockProduct = new Product(
    mockProductSchema.id,
    mockProductSchema.name,
    mockProductSchema.description,
    mockProductSchema.imgUrl,
    mockProductSchema.images,
    mockProductSchema.price,
    mockProductSchema.stock,
    mockProductSchema.category,
    mockProductSchema.rating,
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepositoryAdapter,
        {
          provide: getRepositoryToken(ProductSchema),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<ProductRepositoryAdapter>(ProductRepositoryAdapter);
    repository = module.get(getRepositoryToken(ProductSchema));
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      repository.save.mockResolvedValue(mockProductSchema);

      const result = await adapter.create(mockProduct);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockProductSchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.create(mockProduct);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create product');
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      repository.findOne.mockResolvedValue(mockProductSchema);

      const result = await adapter.findById(mockProductSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockProductSchema.id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockProductSchema.id } });
    });

    it('should return failure when product not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Product not found');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findById(mockProductSchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find product');
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      repository.find.mockResolvedValue([mockProductSchema]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });

    it('should return empty array when no products exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when find throws error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findAll();

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to retrieve products');
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      repository.findOne.mockResolvedValue(mockProductSchema);
      repository.save.mockResolvedValue(mockProductSchema);

      const result = await adapter.update(mockProduct);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockProductSchema.id);
    });

    it('should return failure when product not found for update', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.update(mockProduct);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Product not found');
    });

    it('should return failure when save throws error', async () => {
      repository.findOne.mockResolvedValue(mockProductSchema);
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.update(mockProduct);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to update product');
    });
  });

  describe('toDomain mapping', () => {
    it('should handle null images', async () => {
      const schemaWithNullImages = { ...mockProductSchema, images: null };
      repository.findOne.mockResolvedValue(schemaWithNullImages);

      const result = await adapter.findById(mockProductSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().images).toBeNull();
    });

    it('should handle null category', async () => {
      const schemaWithNullCategory = { ...mockProductSchema, category: null };
      repository.findOne.mockResolvedValue(schemaWithNullCategory);

      const result = await adapter.findById(mockProductSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().category).toBeNull();
    });

    it('should handle null rating', async () => {
      const schemaWithNullRating = { ...mockProductSchema, rating: null };
      repository.findOne.mockResolvedValue(schemaWithNullRating);

      const result = await adapter.findById(mockProductSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().rating).toBeNull();
    });
  });
});
