import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../domain/entities/customer.entity';

/**
 * DTO for customer response
 */
export class CustomerResponseDto {
  @ApiProperty({
    description: 'Customer unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+573001234567',
  })
  phone: string;

  @ApiProperty({
    description: 'Delivery address',
    example: 'Calle 123 #45-67',
  })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Bogotá',
  })
  city: string;

  @ApiProperty({
    description: 'Country',
    example: 'Colombia',
  })
  country: string;

  @ApiProperty({
    description: 'Postal code',
    example: '110111',
  })
  postalCode: string;

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
  static fromEntity(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      postalCode: customer.postalCode,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
