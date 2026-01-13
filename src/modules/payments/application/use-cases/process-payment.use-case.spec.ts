import { ProcessPaymentUseCase } from './process-payment.use-case';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;

  // Mocks para los nuevos servicios
  const paymentPreparationService = {
    prepare: jest.fn(),
  };

  const createTransactionUseCase = {
    execute: jest.fn(),
  };

  const paymentConfirmationService = {
    confirmAndUpdate: jest.fn(),
  };

  const postPaymentOrchestrator = {
    handle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new ProcessPaymentUseCase(
      paymentPreparationService as any,
      createTransactionUseCase as any,
      paymentConfirmationService as any,
      postPaymentOrchestrator as any,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should process payment and approve transaction', async () => {
    // Arrange
    paymentPreparationService.prepare.mockResolvedValue({
      reference: 'ORDER-123',
      adjustedAmount: 10500,
      currency: 'COP',
      acceptanceToken: 'accept-token',
      personalAuthToken: 'auth-token',
    });

    const transaction = {
      id: 'tx-1',
      reference: 'ORDER-123',
      wompiTransactionId: 'wompi-1',
      status: TransactionStatus.PENDING,
      createdAt: new Date(),
    };

    createTransactionUseCase.execute.mockResolvedValue({
      isFailure: false,
      getValue: () => transaction,
    });

    const approvedTransaction = {
      ...transaction,
      status: TransactionStatus.APPROVED,
    };

    paymentConfirmationService.confirmAndUpdate.mockResolvedValue(approvedTransaction);
    postPaymentOrchestrator.handle.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({
      customerId: 'cust-1',
      customerEmail: 'test@test.com',
      amountInCents: 10550,
      currency: 'COP',
      products: [{ productId: 'prod-1', quantity: 1 }],
    } as any);

    // Assert
    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(paymentPreparationService.prepare).toHaveBeenCalled();
    expect(createTransactionUseCase.execute).toHaveBeenCalled();
    expect(paymentConfirmationService.confirmAndUpdate).toHaveBeenCalledWith(transaction);
    expect(postPaymentOrchestrator.handle).toHaveBeenCalledWith(
      approvedTransaction,
      [{ productId: 'prod-1', quantity: 1 }],
    );
  });

  it('should throw error if transaction creation fails', async () => {
    // Arrange
    paymentPreparationService.prepare.mockResolvedValue({
      reference: 'ORDER-123',
      adjustedAmount: 1000,
      currency: 'COP',
      acceptanceToken: 'accept-token',
      personalAuthToken: 'auth-token',
    });

    createTransactionUseCase.execute.mockResolvedValue({
      isFailure: true,
      getError: () => new Error('Transaction failed'),
    });

    // Act & Assert
    await expect(
      useCase.execute({ amountInCents: 1000, products: [] } as any),
    ).rejects.toThrow('Transaction failed');
  });

  it('should not call postPaymentOrchestrator if payment is pending', async () => {
    // Arrange
    paymentPreparationService.prepare.mockResolvedValue({
      reference: 'ORDER-456',
      adjustedAmount: 1000,
      currency: 'COP',
      acceptanceToken: 'accept-token',
      personalAuthToken: 'auth-token',
    });

    const pendingTransaction = {
      id: 'tx-2',
      wompiTransactionId: 'wompi-2',
      status: TransactionStatus.PENDING,
      createdAt: new Date(),
    };

    createTransactionUseCase.execute.mockResolvedValue({
      isFailure: false,
      getValue: () => pendingTransaction,
    });

    paymentConfirmationService.confirmAndUpdate.mockResolvedValue(pendingTransaction);
    postPaymentOrchestrator.handle.mockResolvedValue(undefined);

    // Act
    await useCase.execute({
      amountInCents: 1000,
      products: [{ productId: 'prod-1', quantity: 1 }],
    } as any);

    // Assert
    expect(postPaymentOrchestrator.handle).toHaveBeenCalledWith(
      pendingTransaction,
      [{ productId: 'prod-1', quantity: 1 }],
    );
  });
});

