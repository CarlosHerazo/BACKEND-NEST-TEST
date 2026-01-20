import { ApiProperty } from '@nestjs/swagger';
import { DiscountCode } from '../../domain/entities/discount-code.entity';

export class DiscountCodeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'SUMMER2024' })
  code: string;

  @ApiProperty({ example: 15 })
  discountPercentage: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  static fromEntity(entity: DiscountCode): DiscountCodeResponseDto {
    const dto = new DiscountCodeResponseDto();
    dto.id = entity.id;
    dto.code = entity.code;
    dto.discountPercentage = entity.discountPercentage;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
