import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateDeliveryDto } from '../../application/dtos/create-delivery.dto';
import { DeliveryResponseDto } from '../../application/dtos/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create delivery',
    description: 'Creates a new delivery after a successful payment',
  })
  @ApiResponse({
    status: 201,
    description: 'Delivery created successfully',
    type: DeliveryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or transaction not found/not approved',
  })
  async createDelivery(
    @Body() dto: CreateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    // TODO: Implement createDelivery use case
    throw new BadRequestException('Delivery creation not yet implemented');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get delivery by ID',
    description: 'Retrieves delivery status and details',
  })
  @ApiParam({
    name: 'id',
    description: 'Delivery ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery found',
    type: DeliveryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Delivery not found',
  })
  async getDeliveryById(@Param('id') id: string): Promise<DeliveryResponseDto> {
    // TODO: Implement getDeliveryById use case
    throw new NotFoundException('Delivery retrieval not yet implemented');
  }

  @Get('transaction/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get delivery by transaction ID',
    description: 'Retrieves delivery information for a specific transaction',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery found',
    type: DeliveryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Delivery not found for this transaction',
  })
  async getDeliveryByTransactionId(
    @Param('transactionId') transactionId: string,
  ): Promise<DeliveryResponseDto> {
    // TODO: Implement getDeliveryByTransactionId use case
    throw new NotFoundException(
      'Delivery retrieval by transaction not yet implemented',
    );
  }
}
