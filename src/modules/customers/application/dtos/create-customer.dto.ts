import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating a new customer
 */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Customer phone number (10-15 digits, optionally with +)',
    example: '+573001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone must be 10-15 digits, optionally starting with +',
  })
  phone: string;

  @ApiProperty({
    description: 'Delivery address',
    example: 'Calle 123 #45-67',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address must be at least 5 characters' })
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @MinLength(2, { message: 'City must be at least 2 characters' })
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city: string;

  @ApiProperty({
    description: 'Country',
    example: 'Colombia',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  @MinLength(4, { message: 'Postal code must be at least 4 characters' })
  @MaxLength(10, { message: 'Postal code must not exceed 10 characters' })
  postalCode: string;
}
