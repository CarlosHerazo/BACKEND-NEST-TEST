import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { ProcessPaymentDto } from '../../application/dtos/process-payment.dto';
import { PaymentResponseDto } from '../../application/dtos/payment-response.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let processPaymentUseCase: jest.Mocked<ProcessPaymentUseCase>;

  const mockPaymentResponse: PaymentResponseDto = {
    success: true,
    transactionId: '123e4567-e89b-12d3-a456-426614174000',
    status: 'PENDING',
    reference: 'ORDER-123456',
    redirectUrl: 'https://checkout.wompi.co/redirect',
    message: 'Payment processed successfully',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ProcessPaymentUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    processPaymentUseCase = module.get(ProcessPaymentUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokenizationInfo', () => {
    it('should return tokenization information', () => {
      const originalEnv = process.env.WOMPI_PUBLIC_KEY;
      process.env.WOMPI_PUBLIC_KEY = 'pub_test_123456';

      const result = controller.getTokenizationInfo();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('wompiPublicKey');
      expect(result).toHaveProperty('tokenizationUrl');
      expect(result.wompiPublicKey).toBe('pub_test_123456');
      expect(result.tokenizationUrl).toBe('https://production.wompi.co/v1/tokens/cards');

      process.env.WOMPI_PUBLIC_KEY = originalEnv;
    });

    it('should return empty string when WOMPI_PUBLIC_KEY is not set', () => {
      const originalEnv = process.env.WOMPI_PUBLIC_KEY;
      delete process.env.WOMPI_PUBLIC_KEY;

      const result = controller.getTokenizationInfo();

      expect(result.wompiPublicKey).toBe('');

      process.env.WOMPI_PUBLIC_KEY = originalEnv;
    });
  });

  describe('processPayment', () => {
    const validDto: ProcessPaymentDto = {
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
      customerFullName: 'John Doe',
      customerPhoneNumber: '+573001234567',
      shippingAddress: {
        addressLine1: 'Calle 123',
        city: 'Bogotá',
        region: 'Cundinamarca',
        country: 'CO',
        postalCode: '110111',
      },
      products: [
        { productId: 'product-1', quantity: 2 },
      ],
    };

    it('should process payment successfully', async () => {
      processPaymentUseCase.execute.mockResolvedValue(mockPaymentResponse);

      const result = await controller.processPayment(validDto);

      expect(result).toEqual(mockPaymentResponse);
      expect(processPaymentUseCase.execute).toHaveBeenCalledWith(validDto);
    });

    it('should pass through errors from use case', async () => {
      processPaymentUseCase.execute.mockRejectedValue(new Error('Payment failed'));

      await expect(controller.processPayment(validDto)).rejects.toThrow('Payment failed');
    });

    it('should handle payment with minimal required fields', async () => {
      const minimalDto: ProcessPaymentDto = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        amountInCents: 50000,
        acceptanceToken: 'acceptance-token',
        acceptPersonalAuth: 'personal-auth-token',
        paymentMethod: {
          type: 'CARD',
          token: 'tok_test_123456',
          installments: 1,
        },
        products: [{ productId: 'product-1', quantity: 1 }],
      };

      processPaymentUseCase.execute.mockResolvedValue(mockPaymentResponse);

      const result = await controller.processPayment(minimalDto);

      expect(result).toEqual(mockPaymentResponse);
      expect(processPaymentUseCase.execute).toHaveBeenCalledWith(minimalDto);
    });
  });
});
