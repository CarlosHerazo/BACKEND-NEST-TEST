import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeliveryAddressDto {
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

  @ApiPropertyOptional({ example: '110111' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'Transaction ID associated with this delivery',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ example: 'Carlos Herazo' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ type: DeliveryAddressDto })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  address: DeliveryAddressDto;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Leave at the door' })
  @IsString()
  @IsOptional()
  notes?: string;
}
