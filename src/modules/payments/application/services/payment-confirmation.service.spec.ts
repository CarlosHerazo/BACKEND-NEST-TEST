import { Test, TestingModule } from '@nestjs/testing';
import { PaymentConfirmationService } from './payment-confirmation.service';
import { PaymentStatusCheckerService } from './payment-status-checker.service';
import { TRANSACTION_REPOSITORY } from '../../../transactions/domain/ports/transaction.repository.port';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentStatusResponseDto } from '../dtos/payment-status-response.dto';
import { Result } from '../../../../shared/domain/result';

describe('PaymentConfirmationService', () => {
  let service: PaymentConfirmationService;
  let paymentStatusChecker: jest.Mocked<PaymentStatusCheckerService>;
  let transactionRepository: jest.Mocked<any>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockTransaction = new Transaction(
    '123e4567-e89b-12d3-a456-426614174000',
    'customer-123',
    'test@example.com',
    100000,
    'COP',
    TransactionStatus.PENDING,
    'ORDER-123456',
    'acceptance-token',
    'personal-auth-token',
    { type: 'CARD' },
    'wompi-trans-123',
    'https://redirect.url',
    'link-123',
    'John Doe',
    '+573001234567',
    { city: 'Bogotá' },
    { orderId: '123' },
    undefined,
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentConfirmationService,
        {
          provide: PaymentStatusCheckerService,
          useValue: {
            checkPaymentStatusWithRetry: jest.fn(),
          },
        },
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentConfirmationService>(PaymentConfirmationService);
    paymentStatusChecker = module.get(PaymentStatusCheckerService);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirmAndUpdate', () => {
    it('should return transaction unchanged if no wompiTransactionId', async () => {
      const transactionWithoutWompiId = new Transaction(
        mockTransaction.id,
        mockTransaction.customerId,
        mockTransaction.customerEmail,
        mockTransaction.amountInCents,
        mockTransaction.currency,
        mockTransaction.status,
        mockTransaction.reference,
        mockTransaction.acceptanceToken,
        mockTransaction.acceptPersonalAuth,
        mockTransaction.paymentMethod,
        undefined, // no wompiTransactionId
        mockTransaction.redirectUrl,
        mockTransaction.paymentLinkId,
        mockTransaction.customerFullName,
        mockTransaction.customerPhoneNumber,
        mockTransaction.shippingAddress,
        mockTransaction.metadata,
        mockTransaction.errorMessage,
        mockDate,
        mockDate,
      );

      const result = await service.confirmAndUpdate(transactionWithoutWompiId);

      expect(result).toBe(transactionWithoutWompiId);
      expect(paymentStatusChecker.checkPaymentStatusWithRetry).not.toHaveBeenCalled();
    });

    it('should return original transaction when status check fails', async () => {
      const failedStatusResponse = new PaymentStatusResponseDto(
        false,
        PaymentStatus.ERROR,
        'wompi-trans-123',
        '',
      );

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(failedStatusResponse);

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result).toBe(mockTransaction);
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it('should update transaction with approved status', async () => {
      const approvedStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.APPROVED,
        'wompi-trans-123',
        '{}',
      );

      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.APPROVED);

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(approvedStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(paymentStatusChecker.checkPaymentStatusWithRetry).toHaveBeenCalledWith(
        'wompi-trans-123',
        5,
        2000,
        true,
      );
      expect(transactionRepository.update).toHaveBeenCalled();
    });

    it('should update transaction with declined status', async () => {
      const declinedStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.DECLINED,
        'wompi-trans-123',
        '{}',
      );

      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.DECLINED);

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(declinedStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result.status).toBe(TransactionStatus.DECLINED);
    });

    it('should update transaction with voided status', async () => {
      const voidedStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.VOIDED,
        'wompi-trans-123',
        '{}',
      );

      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.VOIDED);

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(voidedStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result.status).toBe(TransactionStatus.VOIDED);
    });

    it('should return original transaction when repository update fails', async () => {
      const approvedStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.APPROVED,
        'wompi-trans-123',
        '{}',
      );

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(approvedStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.fail(new Error('Update failed')));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result).toBe(mockTransaction);
    });

    it('should map PENDING payment status to PENDING transaction status', async () => {
      const pendingStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.PENDING,
        'wompi-trans-123',
        '{}',
      );

      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.PENDING);

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(pendingStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result.status).toBe(TransactionStatus.PENDING);
    });

    it('should map ERROR payment status to ERROR transaction status', async () => {
      const errorStatusResponse = new PaymentStatusResponseDto(
        true,
        PaymentStatus.ERROR,
        'wompi-trans-123',
        '{}',
      );

      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.ERROR);

      paymentStatusChecker.checkPaymentStatusWithRetry.mockResolvedValue(errorStatusResponse);
      transactionRepository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await service.confirmAndUpdate(mockTransaction);

      expect(result.status).toBe(TransactionStatus.ERROR);
    });
  });
});
