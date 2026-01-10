import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsPositive,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
  IsEmail,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentMethodDto {
  @ApiProperty({
    description: 'Type of payment method',
    example: 'CARD',
  })
  @IsNotEmpty({ message: 'Payment method type is required' })
  @IsString({ message: 'Payment method type must be a string' })
  type: string;

  @ApiPropertyOptional({
    description: 'Payment source token (for saved payment methods)',
    example: 'tok_sandbox_ABC123DEF456',
  })
  @IsOptional()
  @IsString({ message: 'Token must be a string' })
  token?: string;

  @ApiPropertyOptional({
    description: 'Installments for payment',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Installments must be an integer' })
  @Min(1, { message: 'Installments must be at least 1' })
  installments?: number;

  @ApiPropertyOptional({
    description: 'Sandbox status to simulate transaction result (only for testing in sandbox environment). Do not send token when using this field.',
    example: 'APPROVED',
    enum: ['APPROVED', 'DECLINED', 'ERROR', 'PENDING'],
  })
  @IsOptional()
  @IsString({ message: 'Sandbox status must be a string' })
  sandbox_status?: string;
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Customer ID who is making the transaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Customer ID is required' })
  @IsString({ message: 'Customer ID must be a string' })
  customerId: string;

  @ApiProperty({
    description: 'Customer email address (required by Wompi)',
    example: 'customer@example.com',
  })
  @IsNotEmpty({ message: 'Customer email is required' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  customerEmail: string;

  @ApiProperty({
    description: 'Transaction amount in cents (required by Wompi)',
    example: 5000000,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Amount in cents is required' })
  @IsInt({ message: 'Amount must be an integer in cents' })
  @IsPositive({ message: 'Amount must be positive' })
  amountInCents: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'COP',
    default: 'COP',
  })
  @IsOptional()
  @IsString({ message: 'Currency must be a string' })
  @MinLength(3, { message: 'Currency must be 3 characters' })
  @MaxLength(3, { message: 'Currency must be 3 characters' })
  currency?: string;

  @ApiProperty({
    description: 'Acceptance token (required by Wompi)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Acceptance token is required' })
  @IsString({ message: 'Acceptance token must be a string' })
  acceptanceToken: string;

  @ApiProperty({
    description: 'Personal data authorization token (required for Colombia)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Personal authorization token is required' })
  @IsString({ message: 'Personal authorization token must be a string' })
  acceptPersonalAuth: string;

  @ApiProperty({
    description: 'Payment method details',
    type: PaymentMethodDto,
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiProperty({
    description: 'Unique transaction reference',
    example: 'ORDER-12345-1234567890',
  })
  @IsNotEmpty({ message: 'Reference is required' })
  @IsString({ message: 'Reference must be a string' })
  reference: string;

  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString({ message: 'Customer name must be a string' })
  customerFullName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+573001234567',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  customerPhoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: {
      addressLine1: 'Calle 123 #45-67',
      city: 'Bogotá',
      phoneNumber: '+573001234567',
      region: 'Cundinamarca',
      country: 'CO',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Shipping address must be an object' })
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata for the transaction',
    example: { orderId: '12345', productIds: ['1', '2'] },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}
