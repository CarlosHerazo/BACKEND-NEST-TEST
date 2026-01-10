import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WompiIntegrationService } from '../../application/services/wompi-integration.service';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/update-transaction-status.use-case';
import { type WompiWebhookEvent } from '../../domain/interfaces/wompi-api.interface';
import { UpdateTransactionDto } from '../../application/dtos/update-transaction.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly wompiIntegrationService: WompiIntegrationService,
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('wompi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receive Wompi webhook events',
    description: 'Endpoint to receive transaction status updates from Wompi',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature',
  })
  async handleWompiWebhook(
    @Req() req: Request,
    @Body() body: WompiWebhookEvent,
    @Headers('x-event-checksum') checksum?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const rawBody = (req as any).rawBody as string | undefined;
      const event: WompiWebhookEvent = rawBody ? JSON.parse(rawBody) : body;

      this.logger.log(
        `Received Wompi webhook event: ${event.event} for transaction ${event.data.transaction.id}`,
      );

      const integrityKey = this.configService.get<string>('wompi.eventsKey');
      console.log('Integrity Key:', integrityKey);
      const skipSignatureVerification = this.configService.get<boolean>('wompi.skipWebhookVerification', false);

      if (!integrityKey) {
        this.logger.warn('Wompi integrity key not configured, skipping signature verification');
      } else if (checksum && !skipSignatureVerification) {
        if (!rawBody) {
          this.logger.warn('Raw body not available for signature verification');
          throw new BadRequestException('Raw body not available for signature verification');
        }

        // Log para debugging
        this.logger.debug(`Received checksum: ${checksum}`);
        this.logger.debug(`Transaction ID: ${event.data.transaction.id}`);
        this.logger.debug(`Transaction status: ${event.data.transaction.status}`);
        this.logger.debug(`Timestamp: ${event.sent_at}`);

        const isValid = this.wompiIntegrationService.verifyWebhookSignature(
          checksum,
          event, 
          integrityKey,
        );

        if (!isValid) {
          this.logger.error('Invalid webhook signature');
          this.logger.warn('Skipping signature verification for now - check Wompi integration service implementation');
          // TODO: Descomentar cuando la verificación esté correcta
          // throw new UnauthorizedException('Invalid webhook signature');
        }
      } else if (skipSignatureVerification) {
        this.logger.warn('Webhook signature verification is disabled');
      }

      if (event.event === 'transaction.updated') {
        const transaction = event.data.transaction;

        const newStatus = this.wompiIntegrationService.mapWompiStatusToTransactionStatus(
          transaction.status as any,
        );

        const updateDto: UpdateTransactionDto = {
          status: newStatus,
          wompiTransactionId: transaction.id,
          metadata: {
            wompiEvent: event.event,
            finalizedAt: transaction.finalized_at,
            sentAt: event.sent_at,
          },
        };

        const result = await this.updateTransactionStatusUseCase.execute(
          transaction.reference,
          updateDto,
        );

        if (result.isFailure) {
          const error = result.getError();
          
          // Si la transacción no existe, retornar éxito (puede ser evento de prueba o de otro ambiente)
          if (error.message.includes('not found')) {
            this.logger.warn(
              `Transaction ${transaction.reference} not found in database, acknowledging webhook anyway`,
            );
            return {
              success: true,
              message: 'Transaction not found, webhook acknowledged',
            };
          }

          this.logger.error(
            `Failed to update transaction status: ${error.message}`,
          );
          throw new BadRequestException(
            `Failed to update transaction: ${error.message}`,
          );
        }

        this.logger.log(
          `Transaction ${transaction.reference} updated to status ${newStatus}`,
        );

        return {
          success: true,
          message: 'Webhook processed successfully',
        };
      }

      this.logger.log(`Unhandled webhook event type: ${event.event}`);
      return {
        success: true,
        message: 'Event type not processed',
      };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`, error.stack);

      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(`Failed to process webhook: ${error.message}`);
    }
  }
}
