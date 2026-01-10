import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WompiApiClient } from '../../infrastructure/clients/wompi-api.client';
import {
  WompiCreateTransactionRequest,
  WompiMerchantData,
  WompiTransactionStatus,
} from '../../domain/interfaces/wompi-api.interface';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';

@Injectable()
export class WompiIntegrationService {
  private readonly logger = new Logger(WompiIntegrationService.name);
  private merchantData: WompiMerchantData | null = null;
  private readonly integrityKey: string;

  constructor(
    private readonly wompiApiClient: WompiApiClient,
    private readonly configService: ConfigService,
  ) {
    this.integrityKey = this.configService.get<string>('wompi.integrityKey') || '';
  }

  async getMerchantData(forceRefresh: boolean = false): Promise<WompiMerchantData> {
    // Always fetch fresh merchant data to get new acceptance tokens
    // Wompi requires a unique acceptance token for each transaction
    if (!forceRefresh && this.merchantData) {
      return this.merchantData;
    }

    try {
      this.merchantData = await this.wompiApiClient.getMerchantData();

      if (!this.merchantData) {
        throw new Error('Merchant data is null or undefined');
      }

      if (!this.merchantData.presigned_acceptance) {
        this.logger.error('Merchant data received:', JSON.stringify(this.merchantData, null, 2));
        throw new Error('Merchant data does not contain presigned_acceptance');
      }

      if (!this.merchantData.presigned_personal_data_auth) {
        this.logger.error('Merchant data received:', JSON.stringify(this.merchantData, null, 2));
        throw new Error('Merchant data does not contain presigned_personal_data_auth');
      }

      return this.merchantData;
    } catch (error) {
      this.logger.error(`Error fetching merchant data: ${error.message}`);
      throw error;
    }
  }

  async getAcceptanceToken(forceRefresh: boolean = true): Promise<string> {
    // Always get fresh merchant data to ensure unique acceptance token
    const merchantData = await this.getMerchantData(forceRefresh);
    return merchantData.presigned_acceptance.acceptance_token;
  }

  async getPersonalAuthToken(forceRefresh: boolean = true): Promise<string> {
    // Always get fresh merchant data to ensure unique auth token
    const merchantData = await this.getMerchantData(forceRefresh);
    return merchantData.presigned_personal_data_auth.acceptance_token;
  }

  async createTransaction(
    dto: CreateTransactionDto,
  ): Promise<{ wompiTransactionId: string; redirectUrl?: string; paymentLinkId?: string }> {
    try {
      this.logger.log(`Starting Wompi transaction creation for reference: ${dto.reference}`);

      const paymentMethod: any = {
        type: dto.paymentMethod.type,
        installments: dto.paymentMethod.installments || 1,
      };

      if (dto.paymentMethod.token) {
        paymentMethod.token = dto.paymentMethod.token;
      }

      if (dto.paymentMethod.sandbox_status) {
        paymentMethod.sandbox_status = dto.paymentMethod.sandbox_status;
      }

      this.logger.log(`Payment method being sent: ${JSON.stringify(paymentMethod)}`);

      const wompiRequest: WompiCreateTransactionRequest = {
        acceptance_token: dto.acceptanceToken,
        accept_personal_auth: dto.acceptPersonalAuth,
        amount_in_cents: dto.amountInCents,
        currency: dto.currency || 'COP',
        customer_email: dto.customerEmail,
        payment_method: paymentMethod,
        reference: dto.reference,
      };

      this.logger.debug(
        `Wompi request (partial): ${JSON.stringify({
          amount_in_cents: wompiRequest.amount_in_cents,
          currency: wompiRequest.currency,
          customer_email: wompiRequest.customer_email,
          reference: wompiRequest.reference,
          payment_method_type: wompiRequest.payment_method.type,
          has_acceptance_token: !!wompiRequest.acceptance_token,
          has_personal_auth: !!wompiRequest.accept_personal_auth,
        }, null, 2)}`,
      );

      if (dto.customerFullName || dto.customerPhoneNumber) {
        wompiRequest.customer_data = {
          full_name: dto.customerFullName,
          phone_number: dto.customerPhoneNumber,
        };
      }

      if (dto.shippingAddress) {
        wompiRequest.shipping_address = {
          address_line_1: dto.shippingAddress.addressLine1,
          address_line_2: dto.shippingAddress.addressLine2,
          country: dto.shippingAddress.country,
          region: dto.shippingAddress.region,
          city: dto.shippingAddress.city,
          name: dto.shippingAddress.name,
          phone_number: dto.shippingAddress.phoneNumber,
          postal_code: dto.shippingAddress.postalCode,
        };
      }

      // Calculate integrity signature (required by Wompi)
      const signature = this.calculateIntegritySignature(
        dto.reference,
        dto.amountInCents,
        dto.currency || 'COP',
      );

      (wompiRequest as any).signature = signature;

      this.logger.log(`Signature calculated: ${signature}`);

      const response = await this.wompiApiClient.createTransaction(wompiRequest);

      this.logger.log(
        `Transaction created in Wompi: ${response.data.id} with status: ${response.data.status}`,
      );

      // Log full response for debugging
      this.logger.debug(
        `Full Wompi response: ${JSON.stringify({
          id: response.data.id,
          status: response.data.status,
          status_message: response.data.status_message,
          payment_method_type: response.data.payment_method_type,
          has_redirect_url: !!response.data.redirect_url,
          has_payment_link_id: !!response.data.payment_link_id,
        }, null, 2)}`,
      );

      return {
        wompiTransactionId: response.data.id,
        redirectUrl: response.data.redirect_url ?? undefined,
        paymentLinkId: response.data.payment_link_id?.toString() ?? undefined,
      };
    } catch (error) {
      this.logger.error(`Error creating transaction in Wompi: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);

      // Log error details if available
      if (error.response) {
        this.logger.error(
          `Wompi API error response: ${JSON.stringify({
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }, null, 2)}`,
        );
      }

      throw error;
    }
  }

  async getTransactionStatus(wompiTransactionId: string): Promise<TransactionStatus> {
    try {
      const response = await this.wompiApiClient.getTransaction(wompiTransactionId);
      return this.mapWompiStatusToTransactionStatus(
        response.data.status as WompiTransactionStatus,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching transaction status from Wompi: ${error.message}`,
      );
      throw error;
    }
  }

  mapWompiStatusToTransactionStatus(
    wompiStatus: WompiTransactionStatus,
  ): TransactionStatus {
    const statusMap: Record<WompiTransactionStatus, TransactionStatus> = {
      [WompiTransactionStatus.PENDING]: TransactionStatus.PENDING,
      [WompiTransactionStatus.APPROVED]: TransactionStatus.APPROVED,
      [WompiTransactionStatus.DECLINED]: TransactionStatus.DECLINED,
      [WompiTransactionStatus.VOIDED]: TransactionStatus.VOIDED,
      [WompiTransactionStatus.ERROR]: TransactionStatus.ERROR,
    };

    return statusMap[wompiStatus] || TransactionStatus.ERROR;
  }

  calculateIntegritySignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    // According to Wompi docs: reference + amountInCents + currency + integrityKey
    const concatenatedString = `${reference}${amountInCents}${currency}${this.integrityKey}`;

    this.logger.log(`Calculating signature for: reference=${reference}, amount=${amountInCents}, currency=${currency}`);

    const hash = crypto
      .createHash('sha256')
      .update(concatenatedString)
      .digest('hex');

    return hash;
  }

 verifyWebhookSignature(
  checksum: string,
  event: any,
  eventsSecret: string,
): boolean {
  if (!event.signature || !event.signature.properties) {
    console.log('❌ Missing signature or signature.properties');
    return false;
  }

  const { properties } = event.signature;

  let concatenated = '';
  console.log('\n=== WEBHOOK SIGNATURE VERIFICATION ===');
  console.log(`Properties to verify: ${properties.join(', ')}`);
  console.log(`Event timestamp: ${event.timestamp}`);
  console.log(`Event sent_at: ${event.sent_at}`);

  for (const propertyPath of properties) {
    const value = propertyPath
      .split('.')
      .reduce((obj, key) => obj?.[key], event.data);

    if (value === undefined || value === null) {
      console.log(`❌ Property ${propertyPath} not found or is null/undefined`);
      return false;
    }
    console.log(`  ${propertyPath}: ${value}`);

    concatenated += String(value);
  }
  console.log(`\nConcatenated properties: ${concatenated}`);

  // ✅ usar timestamp directo del evento
  const timestamp = event.timestamp;
  concatenated += timestamp;
  console.log(`After adding timestamp: ${concatenated.substring(0, 50)}...${concatenated.substring(concatenated.length - 20)}`);

  concatenated += eventsSecret;
  console.log(`Final concatenated length: ${concatenated.length} chars`);
  console.log(`Concatenated (secret hidden): ${concatenated.replace(eventsSecret, '***SECRET***')}`);

  const generatedChecksum = crypto
    .createHash('sha256')
    .update(concatenated)
    .digest('hex');

  console.log(`\nGenerated checksum: ${generatedChecksum}`);
  console.log(`Provided checksum:  ${checksum}`);
  console.log(`Match: ${generatedChecksum === checksum ? '✅' : '❌'}`);
  console.log('=== END VERIFICATION ===\n');

  return generatedChecksum === checksum;
}

}
