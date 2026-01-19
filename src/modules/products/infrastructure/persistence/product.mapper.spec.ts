import { ProductMapper } from './product.mapper';
import { ProductSchema } from './product.schema';
import { Product } from '../../domain/entities/product.entity';

describe('ProductMapper', () => {
  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockProductSchema: ProductSchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'A test product description',
    imgUrl: 'https://example.com/image.jpg',
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
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

  describe('toDomain', () => {
    it('should map ProductSchema to Product domain entity', () => {
      const result = ProductMapper.toDomain(mockProductSchema);

      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe(mockProductSchema.id);
      expect(result.name).toBe(mockProductSchema.name);
      expect(result.description).toBe(mockProductSchema.description);
      expect(result.imgUrl).toBe(mockProductSchema.imgUrl);
      expect(result.images).toEqual(mockProductSchema.images);
      expect(result.price).toBe(Number(mockProductSchema.price));
      expect(result.stock).toBe(mockProductSchema.stock);
      expect(result.category).toBe(mockProductSchema.category);
      expect(result.rating).toBe(Number(mockProductSchema.rating));
    });

    it('should handle null images', () => {
      const schemaWithNullImages = { ...mockProductSchema, images: null };
      const result = ProductMapper.toDomain(schemaWithNullImages);

      expect(result.images).toBeNull();
    });

    it('should handle null category', () => {
      const schemaWithNullCategory = { ...mockProductSchema, category: null };
      const result = ProductMapper.toDomain(schemaWithNullCategory);

      expect(result.category).toBeNull();
    });

    it('should handle null rating', () => {
      const schemaWithNullRating = { ...mockProductSchema, rating: null };
      const result = ProductMapper.toDomain(schemaWithNullRating);

      expect(result.rating).toBeNull();
    });

    it('should handle undefined images as null', () => {
      const schemaWithUndefinedImages = { ...mockProductSchema, images: undefined as any };
      const result = ProductMapper.toDomain(schemaWithUndefinedImages);

      expect(result.images).toBeNull();
    });
  });

  describe('toSchema', () => {
    it('should map Product domain entity to ProductSchema', () => {
      const result = ProductMapper.toSchema(mockProduct);

      expect(result).toBeInstanceOf(ProductSchema);
      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.name);
      expect(result.description).toBe(mockProduct.description);
      expect(result.imgUrl).toBe(mockProduct.imgUrl);
      expect(result.images).toEqual(mockProduct.images);
      expect(result.price).toBe(mockProduct.price);
      expect(result.stock).toBe(mockProduct.stock);
      expect(result.category).toBe(mockProduct.category);
      expect(result.rating).toBe(mockProduct.rating);
    });

    it('should handle product with null optional fields', () => {
      const productWithNulls = new Product(
        mockProduct.id,
        mockProduct.name,
        mockProduct.description,
        mockProduct.imgUrl,
        null,
        mockProduct.price,
        mockProduct.stock,
        null,
        null,
        mockDate,
        mockDate,
      );

      const result = ProductMapper.toSchema(productWithNulls);

      expect(result.images).toBeNull();
      expect(result.category).toBeNull();
      expect(result.rating).toBeNull();
    });
  });

  describe('bidirectional mapping', () => {
    it('should preserve data when mapping schema -> domain -> schema', () => {
      const domain = ProductMapper.toDomain(mockProductSchema);
      const schema = ProductMapper.toSchema(domain);

      expect(schema.id).toBe(mockProductSchema.id);
      expect(schema.name).toBe(mockProductSchema.name);
      expect(schema.description).toBe(mockProductSchema.description);
      expect(schema.imgUrl).toBe(mockProductSchema.imgUrl);
      expect(schema.images).toEqual(mockProductSchema.images);
      expect(schema.price).toBe(Number(mockProductSchema.price));
      expect(schema.stock).toBe(mockProductSchema.stock);
      expect(schema.category).toBe(mockProductSchema.category);
    });
  });
});
