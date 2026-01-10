import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
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

}
