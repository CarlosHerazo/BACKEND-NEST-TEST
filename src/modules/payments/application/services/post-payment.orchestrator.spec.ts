import { Test, TestingModule } from '@nestjs/testing';
import { PostPaymentOrchestrator, ProductItem } from './post-payment.orchestrator';
import { AutoDeliveryService } from '../../../deliveries/application/services/auto-delivery.service';
import { StockManagerService } from '../../../products/application/services/stock-manager.service';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { Result } from '../../../../shared/domain/result';

describe('PostPaymentOrchestrator', () => {
  let orchestrator: PostPaymentOrchestrator;
  let autoDeliveryService: jest.Mocked<AutoDeliveryService>;
  let stockManagerService: jest.Mocked<StockManagerService>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const createMockTransaction = (status: TransactionStatus): Transaction => {
    return new Transaction(
      '123e4567-e89b-12d3-a456-426614174000',
      'customer-123',
      'test@example.com',
      100000,
      'COP',
      status,
      'ORDER-123456',
      'acceptance-token',
      'personal-auth-token',
      { type: 'CARD' },
      'wompi-trans-123',
      'https://redirect.url',
      'link-123',
      'John Doe',
      '+573001234567',
      { city: 'Bogotá', addressLine1: 'Calle 123' },
      { orderId: '123' },
      undefined,
      mockDate,
      mockDate,
    );
  };

  const mockProducts: ProductItem[] = [
    { productId: 'product-1', quantity: 2 },
    { productId: 'product-2', quantity: 1 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostPaymentOrchestrator,
        {
          provide: AutoDeliveryService,
          useValue: {
            createDeliveryForTransaction: jest.fn(),
          },
        },
        {
          provide: StockManagerService,
          useValue: {
            deductStock: jest.fn(),
          },
        },
      ],
    }).compile();

    orchestrator = module.get<PostPaymentOrchestrator>(PostPaymentOrchestrator);
    autoDeliveryService = module.get(AutoDeliveryService);
    stockManagerService = module.get(StockManagerService);
  });

  it('should be defined', () => {
    expect(orchestrator).toBeDefined();
  });

  describe('handle', () => {
    it('should do nothing when transaction is not approved', async () => {
      const pendingTransaction = createMockTransaction(TransactionStatus.PENDING);

      await orchestrator.handle(pendingTransaction, mockProducts);

      expect(stockManagerService.deductStock).not.toHaveBeenCalled();
      expect(autoDeliveryService.createDeliveryForTransaction).not.toHaveBeenCalled();
    });

    it('should do nothing when transaction is declined', async () => {
      const declinedTransaction = createMockTransaction(TransactionStatus.DECLINED);

      await orchestrator.handle(declinedTransaction, mockProducts);

      expect(stockManagerService.deductStock).not.toHaveBeenCalled();
      expect(autoDeliveryService.createDeliveryForTransaction).not.toHaveBeenCalled();
    });

    it('should deduct stock and create delivery for approved transaction', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      stockManagerService.deductStock.mockResolvedValue(Result.ok(undefined));
      autoDeliveryService.createDeliveryForTransaction.mockResolvedValue('delivery-123');

      await orchestrator.handle(approvedTransaction, mockProducts);

      expect(stockManagerService.deductStock).toHaveBeenCalledWith([
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ]);
      expect(autoDeliveryService.createDeliveryForTransaction).toHaveBeenCalledWith(
        approvedTransaction,
      );
    });

    it('should throw error when stock deduction fails', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      stockManagerService.deductStock.mockRejectedValue(new Error('Insufficient stock'));

      await expect(orchestrator.handle(approvedTransaction, mockProducts)).rejects.toThrow(
        'Insufficient stock',
      );

      expect(autoDeliveryService.createDeliveryForTransaction).not.toHaveBeenCalled();
    });

    it('should throw error when delivery creation fails', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      stockManagerService.deductStock.mockResolvedValue(Result.ok(undefined));
      autoDeliveryService.createDeliveryForTransaction.mockRejectedValue(
        new Error('Delivery creation failed'),
      );

      await expect(orchestrator.handle(approvedTransaction, mockProducts)).rejects.toThrow(
        'Delivery creation failed',
      );
    });

    it('should handle empty products array', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      stockManagerService.deductStock.mockResolvedValue(Result.ok(undefined));
      autoDeliveryService.createDeliveryForTransaction.mockResolvedValue('delivery-123');

      await orchestrator.handle(approvedTransaction, []);

      expect(stockManagerService.deductStock).toHaveBeenCalledWith([]);
      expect(autoDeliveryService.createDeliveryForTransaction).toHaveBeenCalled();
    });
  });
});
