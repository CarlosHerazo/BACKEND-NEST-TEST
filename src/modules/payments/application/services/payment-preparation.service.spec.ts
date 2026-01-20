import { Test, TestingModule } from '@nestjs/testing';
import { PaymentPreparationService } from './payment-preparation.service';
import { WompiIntegrationService } from '../../../transactions/application/services/wompi-integration.service';
import { PriceCalculatorService } from './price-calculator.service';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

describe('PaymentPreparationService', () => {
  let service: PaymentPreparationService;
  let wompiIntegrationService: jest.Mocked<WompiIntegrationService>;
  let priceCalculatorService: jest.Mocked<PriceCalculatorService>;

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
        {
          provide: PriceCalculatorService,
          useValue: {
            calculateTotal: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentPreparationService>(PaymentPreparationService);
    wompiIntegrationService = module.get(WompiIntegrationService);
    priceCalculatorService = module.get(PriceCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prepare', () => {
    const mockDto: ProcessPaymentDto = {
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      customerFullName: 'Test User',
      customerPhoneNumber: '+573001234567',
      currency: 'COP',
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
      priceCalculatorService.calculateTotal.mockResolvedValue({
        subtotalInCents: 100000,
        discountInCents: 0,
        totalInCents: 100000,
        items: [],
      });

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
      priceCalculatorService.calculateTotal.mockResolvedValue({
        subtotalInCents: 100000,
        discountInCents: 0,
        totalInCents: 100000,
        items: [],
      });

      const result1 = await service.prepare(mockDto);
      const result2 = await service.prepare(mockDto);

      expect(result1.reference).not.toBe(result2.reference);
    });

    it('should default to COP when currency is not provided', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');
      priceCalculatorService.calculateTotal.mockResolvedValue({
        subtotalInCents: 100000,
        discountInCents: 0,
        totalInCents: 100000,
        items: [],
      });

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

  describe('prepareWithCalculatedAmount', () => {
    const mockDto: ProcessPaymentDto = {
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      customerFullName: 'Test User',
      customerPhoneNumber: '+573001234567',
      currency: 'COP',
      paymentMethod: {
        type: 'CARD',
        token: 'tok_test_123456',
        installments: 1,
      },
      products: [{ productId: 'product-1', quantity: 1 }],
    };

    it('should prepare payment with calculated amount for COP - rounds to 100', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // 399999 should round to 400000 (nearest 100)
      const result = await service.prepareWithCalculatedAmount(mockDto, 399999);

      expect(result.adjustedAmount).toBe(400000);
      expect(result.currency).toBe('COP');
    });

    it('should round down when closer to lower 100 for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // 399949 should round to 399900 (nearest 100)
      const result = await service.prepareWithCalculatedAmount(mockDto, 399949);

      expect(result.adjustedAmount).toBe(399900);
    });

    it('should handle exact multiples of 100 for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const result = await service.prepareWithCalculatedAmount(mockDto, 400000);

      expect(result.adjustedAmount).toBe(400000);
    });

    it('should not round for USD currency', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const usdDto: ProcessPaymentDto = { ...mockDto, currency: 'USD' };
      const result = await service.prepareWithCalculatedAmount(usdDto, 12345);

      expect(result.adjustedAmount).toBe(12345);
      expect(result.currency).toBe('USD');
    });

    it('should floor decimal amounts before rounding for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // If somehow a decimal amount arrives, it should be floored first
      // 360000.5 -> floor to 360000 -> round to 360000
      const result = await service.prepareWithCalculatedAmount(mockDto, 360000.5);

      expect(result.adjustedAmount).toBe(360000);
    });

    it('should handle discount resulting in amount needing rounding', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // Simulating: 399999 - 39999 (10% discount) = 360000
      // 360000 rounds to 360000 (exact multiple of 100)
      const result = await service.prepareWithCalculatedAmount(mockDto, 360000);

      expect(result.adjustedAmount).toBe(360000);
    });

    it('should round 359950 up to 360000 for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const result = await service.prepareWithCalculatedAmount(mockDto, 359950);

      expect(result.adjustedAmount).toBe(360000);
    });

    it('should round 359949 down to 359900 for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      const result = await service.prepareWithCalculatedAmount(mockDto, 359949);

      expect(result.adjustedAmount).toBe(359900);
    });
  });

  describe('adjustAmount edge cases', () => {
    const mockDto: ProcessPaymentDto = {
      customerId: 'customer-123',
      customerEmail: 'test@example.com',
      customerFullName: 'Test User',
      customerPhoneNumber: '+573001234567',
      currency: 'COP',
      paymentMethod: {
        type: 'CARD',
        token: 'tok_test_123456',
        installments: 1,
      },
      products: [{ productId: 'product-1', quantity: 1 }],
    };

    it('should handle small amounts correctly for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // 50 should round to 100
      const result = await service.prepareWithCalculatedAmount(mockDto, 50);

      expect(result.adjustedAmount).toBe(100);
    });

    it('should handle 49 rounding down to 0 for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // 49 should round to 0
      const result = await service.prepareWithCalculatedAmount(mockDto, 49);

      expect(result.adjustedAmount).toBe(0);
    });

    it('should handle large amounts correctly for COP', async () => {
      wompiIntegrationService.getAcceptanceToken.mockResolvedValue('acceptance-token');
      wompiIntegrationService.getPersonalAuthToken.mockResolvedValue('personal-auth-token');

      // 9999999 should round to 10000000
      const result = await service.prepareWithCalculatedAmount(mockDto, 9999950);

      expect(result.adjustedAmount).toBe(10000000);
    });
  });
});
