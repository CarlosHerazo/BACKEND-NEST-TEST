import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiIntegrationService } from './wompi-integration.service';
import { WompiApiClient } from '../../infrastructure/clients/wompi-api.client';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { WompiTransactionStatus } from '../../domain/interfaces/wompi-api.interface';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';

describe('WompiIntegrationService', () => {
  let service: WompiIntegrationService;
  let mockWompiApiClient: any;
  let mockConfigService: any;

  const mockIntegrityKey = 'test-integrity-key-123';

  beforeEach(async () => {
    mockWompiApiClient = {
      getMerchantData: jest.fn(),
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'wompi.integrityKey') return mockIntegrityKey;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiIntegrationService,
        {
          provide: WompiApiClient,
          useValue: mockWompiApiClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<WompiIntegrationService>(WompiIntegrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMerchantData', () => {
    it('should fetch and cache merchant data', async () => {
      const mockMerchantData = {
        id: 123,
        name: 'Test Merchant',
        email: 'merchant@test.com',
        presigned_acceptance: {
          acceptance_token: 'acceptance-token-123',
          permalink: 'https://wompi.co/acceptance',
          type: 'END_USER_POLICY',
        },
        presigned_personal_data_auth: {
          acceptance_token: 'personal-auth-token-123',
          permalink: 'https://wompi.co/personal-data',
          type: 'PERSONAL_DATA_AUTH',
        },
      };

      mockWompiApiClient.getMerchantData.mockResolvedValue(mockMerchantData);

      const result = await service.getMerchantData();

      expect(result).toEqual(mockMerchantData);
      expect(mockWompiApiClient.getMerchantData).toHaveBeenCalledTimes(1);
    });

    it('should throw error when presigned_acceptance is missing', async () => {
      const invalidMerchantData = {
        id: 123,
        name: 'Test Merchant',
        presigned_personal_data_auth: {
          acceptance_token: 'personal-auth-token-123',
          permalink: 'https://wompi.co/personal-data',
          type: 'PERSONAL_DATA_AUTH',
        },
      };

      mockWompiApiClient.getMerchantData.mockResolvedValue(invalidMerchantData);

      await expect(service.getMerchantData()).rejects.toThrow(
        'Merchant data does not contain presigned_acceptance',
      );
    });

    it('should throw error when presigned_personal_data_auth is missing', async () => {
      const invalidMerchantData = {
        id: 123,
        name: 'Test Merchant',
        presigned_acceptance: {
          acceptance_token: 'acceptance-token-123',
          permalink: 'https://wompi.co/acceptance',
          type: 'END_USER_POLICY',
        },
      };

      mockWompiApiClient.getMerchantData.mockResolvedValue(invalidMerchantData);

      await expect(service.getMerchantData()).rejects.toThrow(
        'Merchant data does not contain presigned_personal_data_auth',
      );
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const mockDto: CreateTransactionDto = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        amountInCents: 5000000,
        currency: 'COP',
        reference: 'ORDER-12345',
        acceptanceToken: 'acceptance-token-123',
        acceptPersonalAuth: 'personal-auth-123',
        paymentMethod: {
          type: 'CARD',
          token: 'card-token-123',
          installments: 1,
        },
      };

      const mockWompiResponse = {
        data: {
          id: 'wompi-transaction-123',
          status: 'PENDING',
          status_message: 'Transaction pending',
          payment_method_type: 'CARD',
          redirect_url: 'https://checkout.wompi.co/l/NmKVrC',
          payment_link_id: '12345',
        },
      };

      mockWompiApiClient.createTransaction.mockResolvedValue(mockWompiResponse);

      const result = await service.createTransaction(mockDto);

      expect(result.wompiTransactionId).toBe('wompi-transaction-123');
      expect(result.redirectUrl).toBe('https://checkout.wompi.co/l/NmKVrC');
      expect(result.paymentLinkId).toBe('12345');
      expect(mockWompiApiClient.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount_in_cents: mockDto.amountInCents,
          currency: mockDto.currency,
          customer_email: mockDto.customerEmail,
          reference: mockDto.reference,
          signature: expect.any(String),
        }),
      );
    });

    it('should handle transaction creation errors', async () => {
      const mockDto: CreateTransactionDto = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        amountInCents: 5000000,
        currency: 'COP',
        reference: 'ORDER-12345',
        acceptanceToken: 'acceptance-token-123',
        acceptPersonalAuth: 'personal-auth-123',
        paymentMethod: {
          type: 'CARD',
          token: 'invalid-token',
        },
      };

      const error = new Error('Invalid card token');
      mockWompiApiClient.createTransaction.mockRejectedValue(error);

      await expect(service.createTransaction(mockDto)).rejects.toThrow('Invalid card token');
    });
  });

  describe('mapWompiStatusToTransactionStatus', () => {
    it('should map PENDING correctly', () => {
      const result = service.mapWompiStatusToTransactionStatus(WompiTransactionStatus.PENDING);
      expect(result).toBe(TransactionStatus.PENDING);
    });

    it('should map APPROVED correctly', () => {
      const result = service.mapWompiStatusToTransactionStatus(WompiTransactionStatus.APPROVED);
      expect(result).toBe(TransactionStatus.APPROVED);
    });

    it('should map DECLINED correctly', () => {
      const result = service.mapWompiStatusToTransactionStatus(WompiTransactionStatus.DECLINED);
      expect(result).toBe(TransactionStatus.DECLINED);
    });

    it('should map VOIDED correctly', () => {
      const result = service.mapWompiStatusToTransactionStatus(WompiTransactionStatus.VOIDED);
      expect(result).toBe(TransactionStatus.VOIDED);
    });

    it('should map ERROR correctly', () => {
      const result = service.mapWompiStatusToTransactionStatus(WompiTransactionStatus.ERROR);
      expect(result).toBe(TransactionStatus.ERROR);
    });

    it('should return ERROR for unknown status', () => {
      const result = service.mapWompiStatusToTransactionStatus('UNKNOWN' as any);
      expect(result).toBe(TransactionStatus.ERROR);
    });
  });

  describe('calculateIntegritySignature', () => {
    it('should calculate signature correctly', () => {
      const reference = 'ORDER-12345';
      const amountInCents = 5000000;
      const currency = 'COP';

      const signature = service.calculateIntegritySignature(reference, amountInCents, currency);

      expect(signature).toBeTruthy();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 produces 64 hex characters
    });

    it('should produce consistent signatures for same input', () => {
      const reference = 'ORDER-12345';
      const amountInCents = 5000000;
      const currency = 'COP';

      const signature1 = service.calculateIntegritySignature(reference, amountInCents, currency);
      const signature2 = service.calculateIntegritySignature(reference, amountInCents, currency);

      expect(signature1).toBe(signature2);
    });

    it('should produce different signatures for different inputs', () => {
      const signature1 = service.calculateIntegritySignature('ORDER-001', 5000000, 'COP');
      const signature2 = service.calculateIntegritySignature('ORDER-002', 5000000, 'COP');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return false when signature properties are missing', () => {
      const event = {
        data: {},
      };

      const result = service.verifyWebhookSignature('checksum', event, 'secret');

      expect(result).toBe(false);
    });

    it('should verify valid webhook signature', () => {
      const event = {
        data: {
          transaction: {
            id: 'wompi-123',
            status: 'APPROVED',
          },
        },
        signature: {
          properties: ['transaction.id', 'transaction.status'],
        },
        timestamp: 1234567890,
      };

      // Calculate expected checksum
      const crypto = require('crypto');
      const concatenated = 'wompi-123' + 'APPROVED' + '1234567890' + 'secret';
      const expectedChecksum = crypto.createHash('sha256').update(concatenated).digest('hex');

      const result = service.verifyWebhookSignature(expectedChecksum, event, 'secret');

      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const event = {
        data: {
          transaction: {
            id: 'wompi-123',
            status: 'APPROVED',
          },
        },
        signature: {
          properties: ['transaction.id', 'transaction.status'],
        },
        timestamp: 1234567890,
      };

      const result = service.verifyWebhookSignature('invalid-checksum', event, 'secret');

      expect(result).toBe(false);
    });
  });

  describe('getTransactionStatus', () => {
    it('should fetch transaction status from Wompi', async () => {
      const mockWompiResponse = {
        data: {
          id: 'wompi-123',
          status: 'APPROVED',
        },
      };

      mockWompiApiClient.getTransaction.mockResolvedValue(mockWompiResponse);

      const result = await service.getTransactionStatus('wompi-123');

      expect(result).toBe(TransactionStatus.APPROVED);
      expect(mockWompiApiClient.getTransaction).toHaveBeenCalledWith('wompi-123');
    });

    it('should handle errors when fetching transaction status', async () => {
      const error = new Error('Transaction not found');
      mockWompiApiClient.getTransaction.mockRejectedValue(error);

      await expect(service.getTransactionStatus('invalid-id')).rejects.toThrow(
        'Transaction not found',
      );
    });
  });
});
