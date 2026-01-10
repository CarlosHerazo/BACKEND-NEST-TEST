import {
  Controller,
  Get,
  Patch,
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
import { GetTransactionByIdUseCase } from '../../application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/update-transaction-status.use-case';
import { UpdateTransactionDto } from '../../application/dtos/update-transaction.dto';
import { TransactionResponseDto } from '../../application/dtos/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves the status and details of a specific transaction',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: TransactionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  async getTransactionById(
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    const result = await this.getTransactionByIdUseCase.execute(id);

    return result.match(
      (transaction) => TransactionResponseDto.fromEntity(transaction),
      (error) => {
        throw new NotFoundException(error.message);
      },
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update transaction status',
    description:
      'Updates the status of a transaction (typically after receiving Wompi callback)',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status updated successfully',
    type: TransactionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Transaction not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid status or transaction in final state',
  })
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const result = await this.updateTransactionStatusUseCase.execute(id, dto);

    return result.match(
      (transaction) => TransactionResponseDto.fromEntity(transaction),
      (error) => {
        if (error.message.includes('not found')) {
          throw new NotFoundException(error.message);
        }
        throw new BadRequestException(error.message);
      },
    );
  }
}
