import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionsByEmailUseCase } from './get-transactions-by-email.use-case';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('GetTransactionsByEmailUseCase', () => {
  let useCase: GetTransactionsByEmailUseCase;
  let mockTransactionRepository: any;

  const mockEmail = 'customer@example.com';

  const mockTransactions = [
    new Transaction(
      'transaction-1',
      'customer-123',
      mockEmail,
      5000000,
      'COP',
      TransactionStatus.APPROVED,
      'ORDER-001',
      'acceptance-token-1',
      'personal-auth-1',
      { type: 'CARD' },
      'wompi-123',
      undefined,
      undefined,
      'John Doe',
      '+573001234567',
      undefined,
      undefined,
      undefined,
      new Date('2024-01-15T10:00:00Z'),
      new Date('2024-01-15T10:05:00Z'),
    ),
    new Transaction(
      'transaction-2',
      'customer-123',
      mockEmail,
      3000000,
      'COP',
      TransactionStatus.PENDING,
      'ORDER-002',
      'acceptance-token-2',
      'personal-auth-2',
      { type: 'CARD' },
      'wompi-456',
      'https://checkout.wompi.co/l/ABC123',
      undefined,
      'John Doe',
      '+573001234567',
      undefined,
      undefined,
      undefined,
      new Date('2024-01-16T10:00:00Z'),
      new Date('2024-01-16T10:01:00Z'),
    ),
  ];

  beforeEach(async () => {
    mockTransactionRepository = {
      findByCustomerEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsByEmailUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionsByEmailUseCase>(GetTransactionsByEmailUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return transactions for a given email', async () => {
      mockTransactionRepository.findByCustomerEmail.mockResolvedValue(
        Result.ok(mockTransactions),
      );

      const result = await useCase.execute(mockEmail);

      expect(result.isSuccess).toBe(true);
      expect(mockTransactionRepository.findByCustomerEmail).toHaveBeenCalledWith(mockEmail);

      const transactions = result.getValue();
      expect(transactions).toHaveLength(2);
      expect(transactions[0].customerEmail).toBe(mockEmail);
      expect(transactions[1].customerEmail).toBe(mockEmail);
    });

    it('should return empty array when no transactions found', async () => {
      mockTransactionRepository.findByCustomerEmail.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute(mockEmail);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual([]);
    });

    it('should fail when repository returns error', async () => {
      const error = new Error('Database connection failed');
      mockTransactionRepository.findByCustomerEmail.mockResolvedValue(Result.fail(error));

      const result = await useCase.execute(mockEmail);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database connection failed');
    });

    it('should handle exception from repository', async () => {
      const error = new Error('Unexpected error');
      mockTransactionRepository.findByCustomerEmail.mockRejectedValue(error);

      await expect(useCase.execute(mockEmail)).rejects.toThrow('Unexpected error');
    });

    it('should return transactions with different statuses', async () => {
      const transactionsWithDifferentStatuses = [
        new Transaction(
          'transaction-1',
          'customer-123',
          mockEmail,
          5000000,
          'COP',
          TransactionStatus.APPROVED,
          'ORDER-001',
          'acceptance-token-1',
          'personal-auth-1',
        ),
        new Transaction(
          'transaction-2',
          'customer-123',
          mockEmail,
          3000000,
          'COP',
          TransactionStatus.DECLINED,
          'ORDER-002',
          'acceptance-token-2',
          'personal-auth-2',
        ),
        new Transaction(
          'transaction-3',
          'customer-123',
          mockEmail,
          2000000,
          'COP',
          TransactionStatus.ERROR,
          'ORDER-003',
          'acceptance-token-3',
          'personal-auth-3',
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          'Wompi error: Card declined',
        ),
      ];

      mockTransactionRepository.findByCustomerEmail.mockResolvedValue(
        Result.ok(transactionsWithDifferentStatuses),
      );

      const result = await useCase.execute(mockEmail);

      expect(result.isSuccess).toBe(true);
      const transactions = result.getValue();
      expect(transactions).toHaveLength(3);
      expect(transactions[0].status).toBe(TransactionStatus.APPROVED);
      expect(transactions[1].status).toBe(TransactionStatus.DECLINED);
      expect(transactions[2].status).toBe(TransactionStatus.ERROR);
      expect(transactions[2].errorMessage).toBe('Wompi error: Card declined');
    });
  });
});
