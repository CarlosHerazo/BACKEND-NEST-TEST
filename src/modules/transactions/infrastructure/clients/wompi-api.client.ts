import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  WompiCreateTransactionRequest,
  WompiTransactionResponse,
  WompiMerchantData,
} from '../../domain/interfaces/wompi-api.interface';

@Injectable()
export class WompiApiClient {
  private readonly logger = new Logger(WompiApiClient.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('wompi.baseUrl') || 'https://api-sandbox.co.uat.wompi.dev/v1';
    this.publicKey = this.configService.get<string>('wompi.publicKey') || '';
    this.privateKey = this.configService.get<string>('wompi.privateKey') || '';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      if (config.url?.includes('/transactions')) {
        config.headers['Authorization'] = `Bearer ${this.privateKey}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `Wompi API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
        );
        throw error;
      },
    );
  }

  async getMerchantData(): Promise<WompiMerchantData> {
    try {
      this.logger.log(`Fetching merchant data for public key: ${this.publicKey}`);
      this.logger.log(`Full URL: ${this.baseUrl}/merchants/${this.publicKey}`);

      const response = await this.axiosInstance.get<{ data: WompiMerchantData }>(
        `/merchants/${this.publicKey}`,
      );

      this.logger.log(`Merchant data response status: ${response.status}`);
      this.logger.log(`Merchant data response received`);

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to fetch merchant data', error);
      this.logger.error(`Error details: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      throw new Error(`Failed to fetch merchant data: ${error.message}`);
    }
  }

  async createTransaction(
    request: WompiCreateTransactionRequest,
  ): Promise<WompiTransactionResponse> {
    try {
      this.logger.log(
        `Creating transaction in Wompi for reference: ${request.reference}`,
      );
      const response = await this.axiosInstance.post<WompiTransactionResponse>(
        '/transactions',
        request,
      );
      this.logger.log(
        `Transaction created successfully: ${response.data.data.id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(
        `Failed to create transaction in Wompi: ${error.response?.data?.error?.reason || error.message}`,
      );
    }
  }

  async getTransaction(transactionId: string): Promise<WompiTransactionResponse> {
    try {
      this.logger.log(`Fetching transaction from Wompi: ${transactionId}`);
      const response = await this.axiosInstance.get<WompiTransactionResponse>(
        `/transactions/${transactionId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch transaction: ${transactionId}`, error);
      throw new Error(`Failed to fetch transaction from Wompi: ${error.message}`);
    }
  }

  async tokenizeCard(cardData: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }): Promise<any> {
    try {
      this.logger.log('Tokenizing card');
      const response = await this.axiosInstance.post(
        '/tokens/cards',
        cardData,
        {
          headers: {
            'Authorization': `Bearer ${this.publicKey}`,
          },
        },
      );
      this.logger.log('Card tokenized successfully');
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to tokenize card: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(
        `Failed to tokenize card: ${error.response?.data?.error?.reason || error.message}`,
      );
    }
  }

  /**
   * Check payment status directly from Wompi
   * This method allows polling the payment status instead of relying only on webhooks
   */
  async checkPaymentStatus(transactionId: string): Promise<{
    success: boolean;
    status: string;
    data: any;
  }> {
    try {
      this.logger.log(`Checking payment status for transaction: ${transactionId}`);

      const response = await this.axiosInstance.get<WompiTransactionResponse>(
        `/transactions/${transactionId}`,
      );

      this.logger.log(
        `Payment status retrieved: ${response.data.data.status}`,
      );

      return {
        success: true,
        status: response.data.data.status,
        data: response.data.data,
      };
    } catch (error) {
      this.logger.error(
        `Failed to check payment status: ${JSON.stringify(error.response?.data)}`,
      );
      return {
        success: false,
        status: 'ERROR',
        data: null,
      };
    }
  }
}
