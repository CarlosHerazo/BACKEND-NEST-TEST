import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

export class PaymentStatusResponseDto {
  @ApiProperty({
    description: 'Whether the status check was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.APPROVED,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment/Transaction ID',
    example: 'abc123-456',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Raw provider response data',
    example: '{"id":"123","status":"APPROVED"}',
  })
  rawData: string;

  constructor(
    success: boolean,
    status: PaymentStatus,
    paymentId: string,
    rawData: string,
  ) {
    this.success = success;
    this.status = status;
    this.paymentId = paymentId;
    this.rawData = rawData;
  }
}
