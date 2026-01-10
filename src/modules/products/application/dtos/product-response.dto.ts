import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../domain/entities/product.entity';

/**
 * DTO for product response
 */
export class ProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Mouse',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Ergonomic wireless mouse with 2.4GHz connection',
  })
  description: string;

  @ApiProperty({
    description: 'Image URL of the product',
    example: 'https://example.com/images/wireless-mouse.png',
  })
  imgUrl: string;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Stock quantity available',
    example: 100,
  })
  stock: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-09T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-09T10:30:00Z',
  })
  updatedAt: Date;

  /**
   * Maps domain entity to response DTO
   */
  static fromEntity(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      imgUrl: product.imgUrl,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
