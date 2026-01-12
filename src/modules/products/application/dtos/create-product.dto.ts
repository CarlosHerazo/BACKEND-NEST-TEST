import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Wireless Mouse',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Ergonomic wireless mouse with USB receiver',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Main product image URL',
    example: 'https://example.com/images/mouse.png',
  })
  @IsUrl()
  imgUrl: string;

  @ApiPropertyOptional({
    description: 'Additional product images',
    example: ['https://example.com/images/mouse1.png', 'https://example.com/images/mouse2.png'],
    nullable: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[] | null;

  @ApiProperty({
    description: 'Product price',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Available stock',
    example: 100,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Electronics',
    nullable: true,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category?: string | null;

  @ApiPropertyOptional({
    description: 'Product rating (0-5)',
    example: 4.5,
    nullable: true,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating?: number | null;

}
