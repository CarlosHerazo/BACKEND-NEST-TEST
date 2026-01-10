import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Transaction ID created in our system',
  })
  transactionId: string;

  @ApiProperty({
    example: '15113-1768032404-44528',
    description: 'Wompi transaction ID',
  })
  wompiTransactionId: string;

  @ApiProperty({
    example: 'ORDER-12345-UNIQUE',
    description: 'Transaction reference',
  })
  reference: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Current transaction status',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'],
  })
  status: string;

  @ApiPropertyOptional({
    example: 'https://checkout.wompi.co/l/WzExMz',
    description: 'Redirect URL for payment completion (if applicable)',
    nullable: true,
  })
  redirectUrl: string | null;

  @ApiPropertyOptional({
    example: '12345',
    description: 'Payment link ID (if applicable)',
    nullable: true,
  })
  paymentLinkId: string | null;

  @ApiProperty({
    example: {
      message: 'Payment initiated successfully',
      nextStep: 'Transaction created and sent to Wompi for processing',
    },
    description: 'Additional information about the payment',
  })
  info: {
    message: string;
    nextStep: string;
  };

  @ApiProperty({
    example: '2026-01-10T08:06:42.770Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}
