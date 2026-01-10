import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PaymentMethodDto {
  @ApiProperty({
    example: 'CARD',
    description: 'Payment method type',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    example: 'tok_stagtest_5113_434EE9B505370D5378bc22201Fa1a268',
    description: 'Payment method token (required for CARD)',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of installments',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  installments?: number;

  @ApiPropertyOptional({
    example: 'APPROVED',
    description: 'Sandbox status for testing',
    enum: ['APPROVED', 'DECLINED', 'ERROR', 'PENDING'],
  })
  @IsString()
  @IsOptional()
  sandbox_status?: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
}

class ShippingAddressDto {
  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apto 301' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'CO' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({
    example: '312ba225-0ed6-4cab-93a1-d182ee95e8a4',
    description: 'Customer ID',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email',
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({
    example: 5000000,
    description: 'Amount in cents (COP)',
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  amountInCents: number;

  @ApiProperty({
    example: 'COP',
    description: 'Currency code',
    default: 'COP',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    type: PaymentMethodDto,
    description: 'Payment method details',
  })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiProperty({
    example: 'Carlos Herazo',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
  customerFullName: string;

  @ApiProperty({
    example: '+573001234567',
    description: 'Customer phone number',
  })
  @IsString()
  @IsNotEmpty()
  customerPhoneNumber: string;

  @ApiPropertyOptional({
    type: ShippingAddressDto,
    description: 'Shipping address',
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsOptional()
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({
    example: { orderId: '12345', productIds: ['1', '2'] },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
