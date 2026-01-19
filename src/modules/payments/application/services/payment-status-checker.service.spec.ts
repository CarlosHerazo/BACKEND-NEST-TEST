import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatusCheckerService } from './payment-status-checker.service';
import { WompiApiClient } from '../../../transactions/infrastructure/clients/wompi-api.client';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('PaymentStatusCheckerService', () => {
  let service: PaymentStatusCheckerService;
  let wompiApiClient: jest.Mocked<WompiApiClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentStatusCheckerService,
        {
          provide: WompiApiClient,
          useValue: {
            checkPaymentStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentStatusCheckerService>(PaymentStatusCheckerService);
    wompiApiClient = module.get(WompiApiClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPaymentStatus', () => {
    it('should return APPROVED status when payment is approved', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'APPROVED',
          status_message: 'Transaction approved',
        },
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(result.paymentId).toBe('payment-123');
    });

    it('should return DECLINED status when payment is declined', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'DECLINED',
          status_message: 'Transaction declined',
        },
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.DECLINED);
    });

    it('should return PENDING status when payment is pending', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'PENDING',
          status_message: 'Transaction pending',
        },
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.PENDING);
    });

    it('should return VOIDED status when payment is voided', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'VOIDED',
          status_message: 'Transaction voided',
        },
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.VOIDED);
    });

    it('should return ERROR status for unknown status', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {
          status: 'UNKNOWN_STATUS',
          status_message: 'Unknown',
        },
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.ERROR);
    });

    it('should return error when API call fails', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: false,
        data: null,
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.ERROR);
    });

    it('should return error when API throws exception', async () => {
      wompiApiClient.checkPaymentStatus.mockRejectedValue(new Error('Network error'));

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.ERROR);
    });

    it('should return error when data.status is missing', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: {},
      });

      const result = await service.checkPaymentStatus('payment-123');

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.ERROR);
    });
  });

  describe('checkPaymentStatusWithRetry', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return immediately when status is APPROVED', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: { status: 'APPROVED' },
      });

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 3, 1000);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(1);
    });

    it('should return immediately when status is DECLINED', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: { status: 'DECLINED' },
      });

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 3, 1000);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.status).toBe(PaymentStatus.DECLINED);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(1);
    });

    it('should retry when status is PENDING and eventually resolve', async () => {
      wompiApiClient.checkPaymentStatus
        .mockResolvedValueOnce({ success: true, data: { status: 'PENDING' } })
        .mockResolvedValueOnce({ success: true, data: { status: 'PENDING' } })
        .mockResolvedValueOnce({ success: true, data: { status: 'APPROVED' } });

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 5, 100, false);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(3);
    });

    it('should return last response after max retries', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: { status: 'PENDING' },
      });

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 3, 100, false);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff when enabled', async () => {
      wompiApiClient.checkPaymentStatus.mockResolvedValue({
        success: true,
        data: { status: 'PENDING' },
      });

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 3, 1000, true);

      // First call is immediate
      await jest.advanceTimersByTimeAsync(0);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(1);

      // Second call after 1000ms (1000 * 2^0)
      await jest.advanceTimersByTimeAsync(1000);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(2);

      // Third call after 2000ms (1000 * 2^1)
      await jest.advanceTimersByTimeAsync(2000);
      expect(wompiApiClient.checkPaymentStatus).toHaveBeenCalledTimes(3);

      await resultPromise;
    });

    it('should return error response if all retries fail', async () => {
      wompiApiClient.checkPaymentStatus.mockRejectedValue(new Error('Network error'));

      const resultPromise = service.checkPaymentStatusWithRetry('payment-123', 2, 100, false);
      await jest.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.ERROR);
    });
  });
});
