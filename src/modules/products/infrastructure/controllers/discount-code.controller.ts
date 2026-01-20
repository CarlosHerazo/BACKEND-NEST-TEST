import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateDiscountCodeDto } from '../../application/dtos/create-discount-code.dto';
import { DiscountCodeResponseDto } from '../../application/dtos/discount-code-response.dto';
import { CreateDiscountCodeUseCase } from '../../application/use-cases/create-discount-code.use-case';
import { ValidateDiscountCodeUseCase } from '../../application/use-cases/validate-discount-code.use-case';
import { GetAllDiscountCodesUseCase } from '../../application/use-cases/get-all-discount-codes.use-case';

@ApiTags('discount-codes')
@Controller('discount-codes')
export class DiscountCodeController {
  private readonly logger = new Logger(DiscountCodeController.name);

  constructor(
    private readonly createDiscountCodeUseCase: CreateDiscountCodeUseCase,
    private readonly validateDiscountCodeUseCase: ValidateDiscountCodeUseCase,
    private readonly getAllDiscountCodesUseCase: GetAllDiscountCodesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discount code' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Discount code created',
    type: DiscountCodeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or code already exists' })
  async createDiscountCode(@Body() dto: CreateDiscountCodeDto): Promise<DiscountCodeResponseDto> {
    this.logger.log(`POST /discount-codes - Creating discount code: ${dto.code}`);

    const result = await this.createDiscountCodeUseCase.execute(dto);

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    return DiscountCodeResponseDto.fromEntity(result.getValue());
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all discount codes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of discount codes',
    type: [DiscountCodeResponseDto],
  })
  async getAllDiscountCodes(): Promise<DiscountCodeResponseDto[]> {
    this.logger.log('GET /discount-codes - Retrieving all discount codes');

    const result = await this.getAllDiscountCodesUseCase.execute();

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    return result.getValue().map(DiscountCodeResponseDto.fromEntity);
  }

  @Get('validate/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a discount code' })
  @ApiParam({ name: 'code', description: 'Discount code to validate', example: 'SUMMER2024' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation result',
    type: DiscountCodeResponseDto,
  })
  async validateDiscountCode(@Param('code') code: string): Promise<{ valid: boolean; discountCode?: DiscountCodeResponseDto; message: string }> {
    this.logger.log(`GET /discount-codes/validate/${code} - Validating discount code`);

    const result = await this.validateDiscountCodeUseCase.execute(code);

    if (result.isFailure) {
      throw new BadRequestException(result.getError().message);
    }

    const validationResult = result.getValue();

    return {
      valid: validationResult.valid,
      discountCode: validationResult.discountCode
        ? DiscountCodeResponseDto.fromEntity(validationResult.discountCode)
        : undefined,
      message: validationResult.message || '',
    };
  }
}
