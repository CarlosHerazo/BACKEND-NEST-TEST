import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO for updating customer information
 */
export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName?: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+573001234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone must be 10-15 digits, optionally starting with +',
  })
  phone?: string;

  @ApiProperty({
    description: 'Delivery address',
    example: 'Calle 123 #45-67',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'Bogotá',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city?: string;

  @ApiProperty({
    description: 'Country',
    example: 'Colombia',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country?: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110111',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'Postal code must be at least 4 characters' })
  @MaxLength(10, { message: 'Postal code must not exceed 10 characters' })
  postalCode?: string;
}
