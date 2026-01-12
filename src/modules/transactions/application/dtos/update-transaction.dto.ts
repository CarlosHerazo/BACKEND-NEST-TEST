import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'New status for the transaction',
    enum: TransactionStatus,
    example: TransactionStatus.APPROVED,
  })
  @IsEnum(TransactionStatus, { message: 'Invalid transaction status' })
  status: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Wompi transaction ID',
    example: 'wompi-12345-abcde',
  })
  @IsOptional()
  @IsString({ message: 'Wompi transaction ID must be a string' })
  wompiTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the transaction update',
    example: { reason: 'Payment approved by Wompi' },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Error message if transaction failed',
    example: 'Wompi error: Insufficient funds',
  })
  @IsOptional()
  @IsString({ message: 'Error message must be a string' })
  errorMessage?: string;
}
