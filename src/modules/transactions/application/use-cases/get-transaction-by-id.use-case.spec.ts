import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionByIdUseCase } from './get-transaction-by-id.use-case';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('GetTransactionByIdUseCase', () => {
  let useCase: GetTransactionByIdUseCase;
  let repository: jest.Mocked<ITransactionRepository>;

  const mockTransaction = new Transaction(
    '123e4567-e89b-12d3-a456-426614174000',
    'customer-id',
    'test@example.com',
    10000,
    'COP',
    TransactionStatus.PENDING,
    'ref-123',
    'acceptance-token',
    'yes',
    {},
    undefined,
    undefined,
    undefined,
    'John Doe',
    '+573001234567',
    {},
    {},
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<ITransactionRepository>> = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionByIdUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTransactionByIdUseCase>(GetTransactionByIdUseCase);
    repository = module.get(TRANSACTION_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should retrieve a transaction by id successfully', async () => {
      repository.findById.mockResolvedValue(Result.ok(mockTransaction));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(repository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should fail if transaction is not found', async () => {
      repository.findById.mockResolvedValue(Result.fail(new Error('Transaction not found')));

      const result = await useCase.execute('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Transaction not found');
    });

    it('should handle repository errors', async () => {
      repository.findById.mockRejectedValue(new Error('Database connection error'));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to retrieve transaction');
    });
  });
});
