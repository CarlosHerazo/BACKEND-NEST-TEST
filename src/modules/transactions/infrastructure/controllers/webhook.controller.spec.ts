import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WompiIntegrationService } from '../../application/services/wompi-integration.service';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/update-transaction-status.use-case';
import { WompiWebhookEvent } from '../../domain/interfaces/wompi-api.interface';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('WebhookController', () => {
  let controller: WebhookController;
  let mockWompiIntegrationService: any;
  let mockUpdateTransactionStatusUseCase: any;
  let mockConfigService: any;

  const mockWebhookEvent: WompiWebhookEvent = {
    event: 'transaction.updated',
    data: {
      transaction: {
        id: 'wompi-123',
        amount_in_cents: 5000000,
        reference: 'ORDER-12345',
        customer_email: 'test@example.com',
        currency: 'COP',
        payment_method_type: 'CARD',
        redirect_url: 'https://checkout.wompi.co/l/NmKVrC',
        status: 'APPROVED',
        shipping_address: null,
        payment_link_id: null,
        created_at: '2024-01-15T10:00:00Z',
        finalized_at: '2024-01-15T10:05:00Z',
      },
    },
    sent_at: '2024-01-15T10:05:01Z',
    timestamp: 1705315501,
    signature: {
      checksum: 'valid-checksum',
      properties: ['transaction.id', 'transaction.status'],
    },
    environment: 'production',
  };

  beforeEach(async () => {
    mockWompiIntegrationService = {
      verifyWebhookSignature: jest.fn(),
      mapWompiStatusToTransactionStatus: jest.fn(),
    };

    mockUpdateTransactionStatusUseCase = {
      execute: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'wompi.eventsKey') return 'test-events-key';
        if (key === 'wompi.skipWebhookVerification') return false;
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WompiIntegrationService,
          useValue: mockWompiIntegrationService,
        },
        {
          provide: UpdateTransactionStatusUseCase,
          useValue: mockUpdateTransactionStatusUseCase,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWompiWebhook', () => {
    it('should process transaction.updated event successfully', async () => {
      const mockTransaction = new Transaction(
        'transaction-123',
        'customer-123',
        'test@example.com',
        5000000,
        'COP',
        TransactionStatus.APPROVED,
        'ORDER-12345',
        'acceptance-token',
        'personal-auth',
      );

      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);
      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.APPROVED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const mockRequest: any = {
        rawBody: JSON.stringify(mockWebhookEvent),
      };

      const result = await controller.handleWompiWebhook(
        mockRequest,
        mockWebhookEvent,
        'valid-checksum',
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Webhook processed successfully');
      expect(mockUpdateTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        'ORDER-12345',
        expect.objectContaining({
          status: TransactionStatus.APPROVED,
          wompiTransactionId: 'wompi-123',
        }),
      );
    });

    it('should handle DECLINED status correctly', async () => {
      const declinedEvent = {
        ...mockWebhookEvent,
        data: {
          transaction: {
            ...mockWebhookEvent.data.transaction,
            status: 'DECLINED',
          },
        },
      };

      const mockTransaction = new Transaction(
        'transaction-123',
        'customer-123',
        'test@example.com',
        5000000,
        'COP',
        TransactionStatus.DECLINED,
        'ORDER-12345',
        'acceptance-token',
        'personal-auth',
      );

      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);
      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.DECLINED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const mockRequest: any = {
        rawBody: JSON.stringify(declinedEvent),
      };

      const result = await controller.handleWompiWebhook(
        mockRequest,
        declinedEvent,
        'valid-checksum',
      );

      expect(result.success).toBe(true);
      expect(mockWompiIntegrationService.mapWompiStatusToTransactionStatus).toHaveBeenCalledWith(
        'DECLINED',
      );
    });

    it('should handle ERROR status correctly', async () => {
      const errorEvent = {
        ...mockWebhookEvent,
        data: {
          transaction: {
            ...mockWebhookEvent.data.transaction,
            status: 'ERROR',
          },
        },
      };

      const mockTransaction = new Transaction(
        'transaction-123',
        'customer-123',
        'test@example.com',
        5000000,
        'COP',
        TransactionStatus.ERROR,
        'ORDER-12345',
        'acceptance-token',
        'personal-auth',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'Payment processing error',
      );

      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);
      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.ERROR,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const mockRequest: any = {
        rawBody: JSON.stringify(errorEvent),
      };

      const result = await controller.handleWompiWebhook(
        mockRequest,
        errorEvent,
        'valid-checksum',
      );

      expect(result.success).toBe(true);
      expect(mockWompiIntegrationService.mapWompiStatusToTransactionStatus).toHaveBeenCalledWith(
        'ERROR',
      );
    });

    it('should acknowledge webhook when transaction not found', async () => {
      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);
      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.APPROVED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Transaction not found')),
      );

      const mockRequest: any = {
        rawBody: JSON.stringify(mockWebhookEvent),
      };

      const result = await controller.handleWompiWebhook(
        mockRequest,
        mockWebhookEvent,
        'valid-checksum',
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Transaction not found, webhook acknowledged');
    });

    it('should throw error when update fails with other error', async () => {
      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);
      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.APPROVED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const mockRequest: any = {
        rawBody: JSON.stringify(mockWebhookEvent),
      };

      await expect(
        controller.handleWompiWebhook(mockRequest, mockWebhookEvent, 'valid-checksum'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unhandled event types', async () => {
      const unknownEvent = {
        ...mockWebhookEvent,
        event: 'payment.created',
      };

      mockWompiIntegrationService.verifyWebhookSignature.mockReturnValue(true);

      const mockRequest: any = {
        rawBody: JSON.stringify(unknownEvent),
      };

      const result = await controller.handleWompiWebhook(
        mockRequest,
        unknownEvent as any,
        'valid-checksum',
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event type not processed');
      expect(mockUpdateTransactionStatusUseCase.execute).not.toHaveBeenCalled();
    });

    it('should process webhook when verification is disabled', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'wompi.skipWebhookVerification') return true;
        return undefined;
      });

      const mockTransaction = new Transaction(
        'transaction-123',
        'customer-123',
        'test@example.com',
        5000000,
        'COP',
        TransactionStatus.APPROVED,
        'ORDER-12345',
        'acceptance-token',
        'personal-auth',
      );

      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.APPROVED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const mockRequest: any = {
        rawBody: JSON.stringify(mockWebhookEvent),
      };

      const result = await controller.handleWompiWebhook(mockRequest, mockWebhookEvent, undefined);

      expect(result.success).toBe(true);
      expect(mockWompiIntegrationService.verifyWebhookSignature).not.toHaveBeenCalled();
    });

    it('should handle webhook without raw body', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'wompi.eventsKey') return 'test-key';
        if (key === 'wompi.skipWebhookVerification') return false;
        return undefined;
      });

      const mockRequest: any = {};

      await expect(
        controller.handleWompiWebhook(mockRequest, mockWebhookEvent, 'checksum'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process webhook without checksum when no integrity key configured', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'wompi.eventsKey') return undefined;
        if (key === 'wompi.skipWebhookVerification') return false;
        return undefined;
      });

      const mockTransaction = new Transaction(
        'transaction-123',
        'customer-123',
        'test@example.com',
        5000000,
        'COP',
        TransactionStatus.APPROVED,
        'ORDER-12345',
        'acceptance-token',
        'personal-auth',
      );

      mockWompiIntegrationService.mapWompiStatusToTransactionStatus.mockReturnValue(
        TransactionStatus.APPROVED,
      );
      mockUpdateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const mockRequest: any = {
        rawBody: JSON.stringify(mockWebhookEvent),
      };

      const result = await controller.handleWompiWebhook(mockRequest, mockWebhookEvent, undefined);

      expect(result.success).toBe(true);
      expect(mockWompiIntegrationService.verifyWebhookSignature).not.toHaveBeenCalled();
    });
  });
});
