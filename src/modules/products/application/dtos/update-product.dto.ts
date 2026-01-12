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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {

  @ApiPropertyOptional({
    description: 'Name of the product',
    example: 'Wireless Mouse',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Ergonomic wireless mouse with USB receiver',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/mouse.png',
  })
  @IsOptional()
  @IsUrl()
  imgUrl?: string;

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

  @ApiPropertyOptional({
    description: 'Product price',
    example: 29.99,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Available stock',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Electronics',
    nullable: true,
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
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating?: number | null;

}
