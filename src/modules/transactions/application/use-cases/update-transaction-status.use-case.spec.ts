import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTransactionStatusUseCase } from './update-transaction-status.use-case';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { UpdateTransactionDto } from '../dtos/update-transaction.dto';

describe('UpdateTransactionStatusUseCase', () => {
  let useCase: UpdateTransactionStatusUseCase;
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
    undefined,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<ITransactionRepository>> = {
      findByReference: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionStatusUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
    repository = module.get(TRANSACTION_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDto: UpdateTransactionDto = {
      status: TransactionStatus.APPROVED,
      wompiTransactionId: 'wompi-123',
    };

    it('should update transaction status successfully', async () => {
      const updatedTransaction = mockTransaction.updateStatus(
        TransactionStatus.APPROVED,
        'wompi-123',
      );

      repository.findByReference.mockResolvedValue(Result.ok(mockTransaction));
      repository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await useCase.execute('ref-123', validDto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status).toBe(TransactionStatus.APPROVED);
      expect(repository.findByReference).toHaveBeenCalledWith('ref-123');
      expect(repository.update).toHaveBeenCalled();
    });

    it('should fail if transaction is not found', async () => {
      repository.findByReference.mockResolvedValue(Result.fail(new Error('Transaction not found')));

      const result = await useCase.execute('non-existent-ref', validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Transaction not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should fail if transaction is in final status', async () => {
      const approvedTransaction = new Transaction(
        '123e4567-e89b-12d3-a456-426614174000',
        'customer-id',
        'test@example.com',
        10000,
        'COP',
        TransactionStatus.APPROVED,
        'ref-123',
        'acceptance-token',
        'yes',
        {},
        'wompi-456',
      );

      repository.findByReference.mockResolvedValue(Result.ok(approvedTransaction));

      const result = await useCase.execute('ref-123', validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('final status');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      repository.findByReference.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute('ref-123', validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to update transaction');
    });

    it('should update transaction with error message', async () => {
      const dtoWithError: UpdateTransactionDto = {
        status: TransactionStatus.ERROR,
        wompiTransactionId: 'wompi-123',
        errorMessage: 'Wompi error: Insufficient funds',
      };

      const updatedTransaction = mockTransaction.updateStatus(
        TransactionStatus.ERROR,
        'wompi-123',
        undefined,
        undefined,
        undefined,
        'Wompi error: Insufficient funds',
      );

      repository.findByReference.mockResolvedValue(Result.ok(mockTransaction));
      repository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await useCase.execute('ref-123', dtoWithError);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status).toBe(TransactionStatus.ERROR);
      expect(result.getValue().errorMessage).toBe('Wompi error: Insufficient funds');
    });

    it('should update transaction to DECLINED status', async () => {
      const declinedDto: UpdateTransactionDto = {
        status: TransactionStatus.DECLINED,
        wompiTransactionId: 'wompi-123',
      };

      const updatedTransaction = mockTransaction.updateStatus(
        TransactionStatus.DECLINED,
        'wompi-123',
      );

      repository.findByReference.mockResolvedValue(Result.ok(mockTransaction));
      repository.update.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await useCase.execute('ref-123', declinedDto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status).toBe(TransactionStatus.DECLINED);
    });
  });
});
