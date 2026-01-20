import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscountCodeDto {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Unique discount code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 15,
    description: 'Discount percentage (1-100)',
  })
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage: number;
}
