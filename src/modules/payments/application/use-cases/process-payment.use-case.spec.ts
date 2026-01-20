import { ProcessPaymentUseCase } from './process-payment.use-case';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;

  // Mocks para los nuevos servicios
  const paymentPreparationService = {
    prepare: jest.fn(),
    prepareWithCalculatedAmount: jest.fn(),
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

  const priceCalculatorService = {
    calculateTotal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new ProcessPaymentUseCase(
      paymentPreparationService as any,
      createTransactionUseCase as any,
      paymentConfirmationService as any,
      postPaymentOrchestrator as any,
      priceCalculatorService as any,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should process payment and approve transaction', async () => {
    // Arrange
    priceCalculatorService.calculateTotal.mockResolvedValue({
      subtotalInCents: 10500,
      discountInCents: 0,
      totalInCents: 10500,
      discountCode: undefined,
      items: [
        {
          productId: 'prod-1',
          productName: 'Test Product',
          unitPriceInCents: 10500,
          quantity: 1,
          lineTotalInCents: 10500,
        },
      ],
    });

    paymentPreparationService.prepareWithCalculatedAmount.mockResolvedValue({
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
    expect(priceCalculatorService.calculateTotal).toHaveBeenCalled();
    expect(paymentPreparationService.prepareWithCalculatedAmount).toHaveBeenCalled();
    expect(createTransactionUseCase.execute).toHaveBeenCalled();
    expect(paymentConfirmationService.confirmAndUpdate).toHaveBeenCalledWith(transaction);
    expect(postPaymentOrchestrator.handle).toHaveBeenCalledWith(
      approvedTransaction,
      [{ productId: 'prod-1', quantity: 1 }],
    );
  });

  it('should throw error if transaction creation fails', async () => {
    // Arrange
    priceCalculatorService.calculateTotal.mockResolvedValue({
      subtotalInCents: 1000,
      discountInCents: 0,
      totalInCents: 1000,
      discountCode: undefined,
      items: [],
    });

    paymentPreparationService.prepareWithCalculatedAmount.mockResolvedValue({
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
    priceCalculatorService.calculateTotal.mockResolvedValue({
      subtotalInCents: 1000,
      discountInCents: 0,
      totalInCents: 1000,
      discountCode: undefined,
      items: [
        {
          productId: 'prod-1',
          productName: 'Test Product',
          unitPriceInCents: 1000,
          quantity: 1,
          lineTotalInCents: 1000,
        },
      ],
    });

    paymentPreparationService.prepareWithCalculatedAmount.mockResolvedValue({
      reference: 'ORDER-456',
      adjustedAmount: 1000,
      currency: 'COP',
      acceptanceToken: 'accept-token',
      personalAuthToken: 'auth-token',
    });

    const pendingTransaction = {
      id: 'tx-2',
      reference: 'ORDER-456',
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

  it('should apply discount code when provided', async () => {
    // Arrange
    const mockDiscountCode = {
      id: 'discount-1',
      code: 'SUMMER2024',
    };

    priceCalculatorService.calculateTotal.mockResolvedValue({
      subtotalInCents: 10000,
      discountInCents: 1000,
      totalInCents: 9000,
      discountCode: mockDiscountCode,
      items: [
        {
          productId: 'prod-1',
          productName: 'Test Product',
          unitPriceInCents: 10000,
          quantity: 1,
          lineTotalInCents: 10000,
        },
      ],
    });

    paymentPreparationService.prepareWithCalculatedAmount.mockResolvedValue({
      reference: 'ORDER-789',
      adjustedAmount: 9000,
      currency: 'COP',
      acceptanceToken: 'accept-token',
      personalAuthToken: 'auth-token',
    });

    const transaction = {
      id: 'tx-3',
      reference: 'ORDER-789',
      wompiTransactionId: 'wompi-3',
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
      amountInCents: 10000,
      currency: 'COP',
      products: [{ productId: 'prod-1', quantity: 1 }],
      discountCodeId: 'discount-1',
    } as any);

    // Assert
    expect(priceCalculatorService.calculateTotal).toHaveBeenCalledWith(
      [{ productId: 'prod-1', quantity: 1 }],
      'discount-1',
    );
    expect(result.priceBreakdown?.discountInCents).toBe(1000);
    expect(result.priceBreakdown?.totalInCents).toBe(9000);
  });
});

