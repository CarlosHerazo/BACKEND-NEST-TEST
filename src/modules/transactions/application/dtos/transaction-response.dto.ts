import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  customerId: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Transaction amount in cents',
    example: 5000000,
  })
  amountInCents: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP',
  })
  currency: string;

  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Transaction reference',
    example: 'ORDER-12345',
  })
  reference: string;

  @ApiPropertyOptional({
    description: 'Payment method details',
    example: { type: 'CARD', token: '12345' },
  })
  paymentMethod?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Wompi transaction ID',
    example: 'wompi-12345-abcde',
  })
  wompiTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Redirect URL for 3D Secure',
    example: 'https://checkout.wompi.co/l/NmKVrC',
  })
  redirectUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment link ID',
    example: '12345',
  })
  paymentLinkId?: string;

  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'John Doe',
  })
  customerFullName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+573001234567',
  })
  customerPhoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: { city: 'Bogotá', country: 'CO' },
  })
  shippingAddress?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { orderId: '12345' },
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Error message if transaction failed',
    example: 'Wompi error: Insufficient funds',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:35:00Z',
  })
  updatedAt: Date;

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      customerId: transaction.customerId,
      customerEmail: transaction.customerEmail,
      amountInCents: transaction.amountInCents,
      currency: transaction.currency,
      status: transaction.status,
      reference: transaction.reference,
      paymentMethod: transaction.paymentMethod,
      wompiTransactionId: transaction.wompiTransactionId,
      redirectUrl: transaction.redirectUrl,
      paymentLinkId: transaction.paymentLinkId,
      customerFullName: transaction.customerFullName,
      customerPhoneNumber: transaction.customerPhoneNumber,
      shippingAddress: transaction.shippingAddress,
      metadata: transaction.metadata,
      errorMessage: transaction.errorMessage,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
