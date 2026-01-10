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
  ApiProperty,
} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { WompiApiClient } from '../../../transactions/infrastructure/clients/wompi-api.client';
import { CreateTransactionUseCase } from '../../../transactions/application/use-cases/create-transaction.use-case';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';
import { PaymentResponseDto } from '../../application/dtos/payment-response.dto';
import { PaymentStatusCheckerService } from '../../application/services/payment-status-checker.service';
import {
  type ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../transactions/domain/ports/transaction.repository.port';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { AutoDeliveryService } from '../../../deliveries/application/services/auto-delivery.service';

class TokenizeCardDto {
  @ApiProperty({
    description: 'Card number',
    example: '4242424242424242',
  })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Card CVC',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  cvc: string;

  @ApiProperty({
    description: 'Expiration month (MM)',
    example: '12',
  })
  @IsNotEmpty()
  @IsString()
  exp_month: string;

  @ApiProperty({
    description: 'Expiration year (YY)',
    example: '28',
  })
  @IsNotEmpty()
  @IsString()
  exp_year: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'Juan Perez',
  })
  @IsNotEmpty()
  @IsString()
  card_holder: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly paymentStatusChecker: PaymentStatusCheckerService,
    private readonly autoDeliveryService: AutoDeliveryService,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
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
    summary: 'Tokenize credit card with Wompi',
    description:
      'Tokenizes a credit card using Wompi. Returns information needed for frontend tokenization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Card tokenization information provided',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Card tokenization process started',
        },
        instructions: {
          type: 'string',
          example:
            'Use Wompi.js library on the frontend to tokenize cards securely',
        },
        wompiPublicKey: {
          type: 'string',
          example: 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mG',
        },
      },
    },
  })
  async tokenizeCard(): Promise<{
    message: string;
    instructions: string;
    wompiPublicKey: string;
  }> {
    // Card tokenization debe hacerse en el frontend usando Wompi.js
    // Este endpoint solo provee la información necesaria
    return {
      message: 'Card tokenization process started',
      instructions:
        'Use Wompi.js library on the frontend to tokenize cards securely. Visit https://docs.wompi.co/docs/en/widgets-checkout for more information.',
      wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || '',
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
    try {
      this.logger.log(
        `Processing payment for customer ${paymentDto.customerId}, amount: ${paymentDto.amountInCents}`,
      );

      // 1. Obtener tokens de aceptación de Wompi
      const acceptanceToken =
        await this.wompiIntegrationService.getAcceptanceToken();
      const personalAuthToken =
        await this.wompiIntegrationService.getPersonalAuthToken();

      // 2. Generar referencia única para la transacción
      const reference = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // 3. Crear el DTO de transacción completo
      const createTransactionDto = {
        customerId: paymentDto.customerId,
        customerEmail: paymentDto.customerEmail,
        amountInCents: paymentDto.amountInCents,
        currency: paymentDto.currency || 'COP',
        reference,
        paymentMethod: paymentDto.paymentMethod,
        acceptanceToken,
        acceptPersonalAuth: personalAuthToken,
        customerFullName: paymentDto.customerFullName,
        customerPhoneNumber: paymentDto.customerPhoneNumber,
        shippingAddress: paymentDto.shippingAddress,
        metadata: paymentDto.metadata,
      };

      // 4. Crear transacción (esto también la procesa con Wompi)
      const result =
        await this.createTransactionUseCase.execute(createTransactionDto);

      if (result.isFailure) {
        const error = result.getError();
        this.logger.error(`Payment processing failed: ${error.message}`);
        throw new BadRequestException(
          `Payment processing failed: ${error.message}`,
        );
      }

      const transaction = result.getValue();

      this.logger.log(
        `Payment processed successfully. Transaction ID: ${transaction.id}, Wompi ID: ${transaction.wompiTransactionId}`,
      );

      // 5. Check payment status immediately (no esperar por webhook)
      let finalTransaction = transaction;
      if (transaction.wompiTransactionId) {
        try {
          this.logger.log(
            `Checking payment status for Wompi transaction: ${transaction.wompiTransactionId}`,
          );

          const statusCheck = await this.paymentStatusChecker.checkPaymentStatusWithRetry(
            transaction.wompiTransactionId,
            5, // 5 retries (attempts: 2s, 4s, 8s, 16s intervals = ~30s total)
            2000, // 2 seconds initial delay
            true, // Use exponential backoff
          );

          if (statusCheck.success) {
            this.logger.log(
              `Payment status retrieved: ${statusCheck.status}`,
            );

            // Map PaymentStatus to TransactionStatus
            const transactionStatus = this.mapPaymentStatusToTransactionStatus(
              statusCheck.status,
            );

            // Update transaction status in database
            const updatedTransaction = transaction.updateStatus(
              transactionStatus,
              transaction.wompiTransactionId,
              transaction.redirectUrl,
              transaction.paymentLinkId,
            );

            const updateResult = await this.transactionRepository.update(
              updatedTransaction,
            );

            if (updateResult.isSuccess) {
              finalTransaction = updateResult.getValue();
              this.logger.log(
                `Transaction status updated to: ${transactionStatus}`,
              );

              // 5.5. Auto-create delivery if payment is approved
              if (transactionStatus === TransactionStatus.APPROVED) {
                this.logger.log(
                  `Payment approved, creating delivery for transaction ${finalTransaction.id}`,
                );

                try {
                  const deliveryId = await this.autoDeliveryService.createDeliveryForTransaction(
                    finalTransaction,
                  );

                  if (deliveryId) {
                    this.logger.log(
                      `Delivery ${deliveryId} created automatically for transaction ${finalTransaction.id}`,
                    );
                  }
                } catch (deliveryError) {
                  // Log error but don't fail the payment response
                  this.logger.error(
                    `Failed to create delivery for transaction ${finalTransaction.id}: ${deliveryError.message}`,
                  );
                }
              }
            }
          }
        } catch (statusError) {
          // Log error but don't fail the response
          this.logger.warn(
            `Could not check payment status: ${statusError.message}`,
          );
        }
      }

      // 6. Construir respuesta
      const response: PaymentResponseDto = {
        transactionId: finalTransaction.id,
        wompiTransactionId: finalTransaction.wompiTransactionId || '',
        reference: finalTransaction.reference,
        status: finalTransaction.status,
        redirectUrl: finalTransaction.redirectUrl || null,
        paymentLinkId: finalTransaction.paymentLinkId || null,
        info: {
          message: 'Payment processed successfully',
          nextStep:
            finalTransaction.status === TransactionStatus.APPROVED
              ? 'Payment approved and completed'
              : finalTransaction.status === TransactionStatus.DECLINED
                ? 'Payment was declined'
                : 'Payment is being processed. Status has been verified with provider.',
        },
        createdAt: finalTransaction.createdAt,
      };

      return response;
    } catch (error) {
      this.logger.error(
        `Error processing payment: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to process payment: ${error.message}`,
      );
    }
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
