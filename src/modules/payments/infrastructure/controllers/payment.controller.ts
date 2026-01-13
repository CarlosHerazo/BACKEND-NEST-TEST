import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';
import { PaymentResponseDto } from '../../application/dtos/payment-response.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  // 1. Información para tokenización (NO negocio)
  @Get('tokenization-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get card tokenization information',
    description:
      'Provides public information required to tokenize cards directly from the frontend. No sensitive data is handled by the backend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokenization information',
  })
  getTokenizationInfo(): {
    wompiPublicKey: string;
    tokenizationUrl: string;
    message: string;
  } {
    return {
      message:
        'Tokenize cards directly from frontend using Wompi public API. Never send card data to backend.',
      wompiPublicKey: process.env.WOMPI_PUBLIC_KEY ?? '',
      tokenizationUrl: 'https://production.wompi.co/v1/tokens/cards',
    };
  }

  // 2. Procesar pago (CASO DE USO PRINCIPAL)
  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process payment',
    description:
      'Processes a complete payment flow using the application use case.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment processing failed',
  })
  async processPayment(
    @Body() dto: ProcessPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.processPaymentUseCase.execute(dto);
  }
}
