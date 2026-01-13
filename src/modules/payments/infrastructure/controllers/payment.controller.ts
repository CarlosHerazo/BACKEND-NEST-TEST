import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { CreateTransactionUseCase } from '../../../transactions/application/use-cases/create-transaction.use-case';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';
import { PaymentResponseDto } from '../../application/dtos/payment-response.dto';
import { PaymentStatusCheckerService } from '../../application/services/payment-status-checker.service';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
    private readonly paymentStatusChecker: PaymentStatusCheckerService,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
  ) {}

  @Get('acceptance-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Wompi acceptance token',
    description:
      'Retrieves the acceptance token required for processing payments with Wompi',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceptance token retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        acceptanceToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        personalAuthToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving acceptance token',
  })
  async getAcceptanceToken(): Promise<{
    acceptanceToken: string;
    personalAuthToken: string;
  }> {
    try {
      const acceptanceToken =
        await this.wompiIntegrationService.getAcceptanceToken();
      const personalAuthToken =
        await this.wompiIntegrationService.getPersonalAuthToken();

      return {
        acceptanceToken,
        personalAuthToken,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to get acceptance tokens: ${error.message}`,
      );
    }
  }

  @Post('tokenize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Wompi tokenization information',
    description:
      '⚠️ IMPORTANT: Card tokenization MUST be done from the frontend directly. This endpoint only provides the public key and instructions. Never send card data to the backend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokenization information provided (for frontend use only)',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Tokenize cards directly from your frontend',
        },
        instructions: {
          type: 'string',
          example:
            'SECURITY: Tokenize from frontend using Wompi API directly. Never send card data to backend.',
        },
        wompiPublicKey: {
          type: 'string',
          example: 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mG',
        },
        tokenizationUrl: {
          type: 'string',
          example: 'https://production.wompi.co/v1/tokens/cards',
        },
      },
    },
  })
  async getTokenizationInfo(): Promise<{
    message: string;
    instructions: string;
    wompiPublicKey: string;
    tokenizationUrl: string;
  }> {
    // SECURITY: Card tokenization MUST be done in the frontend
    // This endpoint only provides the necessary information
    return {
      message: 'Tokenize cards directly from your frontend',
      instructions:
        'SECURITY: Call Wompi API directly from frontend (POST https://production.wompi.co/v1/tokens/cards) with card data and public key. Then send only the token to backend /payments/process endpoint. Never send raw card data to backend.',
      wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || '',
      tokenizationUrl: 'https://production.wompi.co/v1/tokens/cards',
    };
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process complete payment',
    description:
      'Processes a complete payment transaction using Wompi. Creates a transaction and sends it to Wompi for processing.',
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
    @Body() paymentDto: ProcessPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.processPaymentUseCase.execute(paymentDto);
  }

  @Get('status/:wompiTransactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check payment status with retries',
    description:
      'Checks the payment status from Wompi with automatic retries. Useful when you need to verify the current status of a payment. Uses exponential backoff (2s, 4s, 8s, 16s) for up to 5 attempts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'],
          example: 'APPROVED',
        },
        paymentId: {
          type: 'string',
          example: '15113-1768060515-95120',
        },
        details: {
          type: 'string',
          description: 'Raw response from payment provider',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error checking payment status',
  })
  async checkPaymentStatus(
    @Param('wompiTransactionId') wompiTransactionId: string,
  ): Promise<{
    success: boolean;
    status: string;
    paymentId: string;
    details: string;
    message: string;
  }> {
    try {
      this.logger.log(
        `Checking payment status for: ${wompiTransactionId} with retries`,
      );

      const statusCheck = await this.paymentStatusChecker.checkPaymentStatusWithRetry(
        wompiTransactionId,
        5, // 5 retries
        2000, // 2 seconds initial delay
        true, // Use exponential backoff
      );

      return {
        success: statusCheck.success,
        status: statusCheck.status,
        paymentId: statusCheck.paymentId,
        details: statusCheck.rawData,
        message: statusCheck.success
          ? `Payment status is ${statusCheck.status}`
          : 'Failed to retrieve payment status',
      };
    } catch (error) {
      this.logger.error(
        `Error checking payment status: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException(
        `Failed to check payment status: ${error.message}`,
      );
    }
  }

  /**
   * Maps PaymentStatus enum to TransactionStatus enum
   */
  private mapPaymentStatusToTransactionStatus(
    paymentStatus: PaymentStatus,
  ): TransactionStatus {
    const statusMap: Record<PaymentStatus, TransactionStatus> = {
      [PaymentStatus.PENDING]: TransactionStatus.PENDING,
      [PaymentStatus.APPROVED]: TransactionStatus.APPROVED,
      [PaymentStatus.DECLINED]: TransactionStatus.DECLINED,
      [PaymentStatus.VOIDED]: TransactionStatus.VOIDED,
      [PaymentStatus.ERROR]: TransactionStatus.ERROR,
    };

    return statusMap[paymentStatus] || TransactionStatus.ERROR;
  }
}
