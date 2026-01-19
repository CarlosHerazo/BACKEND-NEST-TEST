import { Test, TestingModule } from '@nestjs/testing';
import { PaymentPreparationService } from './payment-preparation.service';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

describe('PaymentPreparationService', () => {
  let service: PaymentPreparationService;
  let wompiIntegrationService: jest.Mocked<WompiIntegrationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentPreparationService,
        {
          provide: WompiIntegrationService,
          useValue: {
            getAcceptanceToken: jest.fn(),
            getPersonalAuthToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentPreparationService>(PaymentPreparationService);
    wompiIntegrationService = module.get(WompiIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prepare', () => {
    const mockDto: ProcessPaymentDto = {
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      amountInCents: 100000,
      currency: 'COP',
      acceptanceToken: 'acceptance-token',
      acceptPersonalAuth: 'personal-auth-token',
      paymentMethod: {
        type: 'CARD',
        token: 'tok_test_123456',
        installments: 1,
      },
      products: [{ productId: 'product-1', quantity: 1 }],
    };

    it('should prepare payment data successfully', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token-123');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token-123');

      const result = await service.prepare(mockDto);

      expect(result).toHaveProperty('reference');
      expect(result.reference).toMatch(/^ORDER-\d+-[A-Z0-9]+$/);
      expect(result).toHaveProperty('adjustedAmount');
      expect(result).toHaveProperty('currency', 'COP');
      expect(result).toHaveProperty('acceptanceToken', 'acceptance-token-123');
      expect(result).toHaveProperty('personalAuthToken', 'personal-auth-token-123');
      expect(wompiIntegrationService.getAcceptanceToken).toHaveBeenCalled();
      expect(wompiIntegrationService.getPersonalAuthToken).toHaveBeenCalled();
    });

    it('should generate unique references', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const result1 = await service.prepare(mockDto);
      const result2 = await service.prepare(mockDto);

      expect(result1.reference).not.toBe(result2.reference);
    });

    it('should adjust amount for COP currency (round to nearest 100)', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const dtoWithOddAmount: ProcessPaymentDto = {
        ...mockDto,
        amountInCents: 12345,
        currency: 'COP',
      };

      const result = await service.prepare(dtoWithOddAmount);

      expect(result.adjustedAmount).toBe(12300);
    });

    it('should not adjust amount for non-COP currency', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const dtoWithUSD: ProcessPaymentDto = {
        ...mockDto,
        amountInCents: 12345,
        currency: 'USD',
      };

      const result = await service.prepare(dtoWithUSD);

      expect(result.adjustedAmount).toBe(12345);
    });

    it('should default to COP when currency is not provided', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const dtoWithoutCurrency: ProcessPaymentDto = {
        ...mockDto,
        currency: undefined,
      };

      const result = await service.prepare(dtoWithoutCurrency);

      expect(result.currency).toBe('COP');
    });

    it('should pass through errors from wompi service', async () => {
      wompiIntegrationService.getAcceptanceToken.mockRejectedValue(
        new Error('Wompi service error'),
      );

      await expect(service.prepare(mockDto)).rejects.toThrow('Wompi service error');
    });
  });
});
