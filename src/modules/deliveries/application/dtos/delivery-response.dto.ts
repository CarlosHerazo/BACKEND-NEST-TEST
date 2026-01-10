import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

export class DeliveryResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  transactionId: string;

  @ApiProperty({ example: 'Carlos Herazo' })
  customerName: string;

  @ApiProperty({ example: '+573001234567' })
  customerPhone: string;

  @ApiProperty({
    example: {
      addressLine1: 'Calle 123 #45-67',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'CO',
    },
  })
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
  };

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @ApiPropertyOptional({ example: 'TRACK123456789' })
  trackingNumber?: string;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00.000Z' })
  estimatedDeliveryDate?: Date;

  @ApiPropertyOptional({ example: '2026-01-14T15:30:00.000Z' })
  actualDeliveryDate?: Date;

  @ApiPropertyOptional({ example: 'Leave at the door' })
  notes?: string;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  updatedAt: Date;

  static fromEntity(delivery: Delivery): DeliveryResponseDto {
    const dto = new DeliveryResponseDto();
    dto.id = delivery.id;
    dto.transactionId = delivery.transactionId;
    dto.customerName = delivery.customerName;
    dto.customerPhone = delivery.customerPhone;
    dto.address = delivery.address;
    dto.status = delivery.status;
    dto.trackingNumber = delivery.trackingNumber;
    dto.estimatedDeliveryDate = delivery.estimatedDeliveryDate;
    dto.actualDeliveryDate = delivery.actualDeliveryDate;
    dto.notes = delivery.notes;
    dto.createdAt = delivery.createdAt;
    dto.updatedAt = delivery.updatedAt;
    return dto;
  }
}
