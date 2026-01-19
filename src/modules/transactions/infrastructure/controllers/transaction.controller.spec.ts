import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { GetTransactionByIdUseCase } from '../../application/use-cases/get-transaction-by-id.use-case';
import { UpdateTransactionStatusUseCase } from '../../application/use-cases/update-transaction-status.use-case';
import { GetTransactionsByEmailUseCase } from '../../application/use-cases/get-transactions-by-email.use-case';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Result } from '../../../../shared/domain/result';
import { UpdateTransactionDto } from '../../application/dtos/update-transaction.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let getTransactionByIdUseCase: jest.Mocked<GetTransactionByIdUseCase>;
  let updateTransactionStatusUseCase: jest.Mocked<UpdateTransactionStatusUseCase>;
  let getTransactionsByEmailUseCase: jest.Mocked<GetTransactionsByEmailUseCase>;

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
    'wompi-123',
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
      controllers: [TransactionController],
      providers: [
        {
          provide: GetTransactionByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateTransactionStatusUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTransactionsByEmailUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    getTransactionByIdUseCase = module.get(GetTransactionByIdUseCase);
    updateTransactionStatusUseCase = module.get(UpdateTransactionStatusUseCase);
    getTransactionsByEmailUseCase = module.get(GetTransactionsByEmailUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactionById', () => {
    it('should return a transaction by id', async () => {
      getTransactionByIdUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.getTransactionById(mockTransaction.id);

      expect(result.id).toBe(mockTransaction.id);
      expect(result.status).toBe(mockTransaction.status);
      expect(getTransactionByIdUseCase.execute).toHaveBeenCalledWith(mockTransaction.id);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      getTransactionByIdUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Transaction not found')),
      );

      await expect(controller.getTransactionById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTransactionStatus', () => {
    const updateDto: UpdateTransactionDto = {
      status: TransactionStatus.APPROVED,
    };

    it('should update transaction status successfully', async () => {
      const updatedTransaction = mockTransaction.updateStatus(TransactionStatus.APPROVED);
      updateTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(updatedTransaction));

      const result = await controller.updateTransactionStatus(mockTransaction.id, updateDto);

      expect(result.status).toBe(TransactionStatus.APPROVED);
      expect(updateTransactionStatusUseCase.execute).toHaveBeenCalledWith(
        mockTransaction.id,
        updateDto,
      );
    });

    it('should throw NotFoundException when transaction not found for update', async () => {
      updateTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Transaction not found')),
      );

      await expect(
        controller.updateTransactionStatus('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      updateTransactionStatusUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Invalid status transition')),
      );

      await expect(
        controller.updateTransactionStatus(mockTransaction.id, updateDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactionsByEmail', () => {
    it('should return transactions by email', async () => {
      getTransactionsByEmailUseCase.execute.mockResolvedValue(Result.ok([mockTransaction]));

      const result = await controller.getTransactionsByEmail('test@example.com');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0].customerEmail).toBe('test@example.com');
      expect(getTransactionsByEmailUseCase.execute).toHaveBeenCalledWith('test@example.com');
    });

    it('should return empty array when no transactions found for email', async () => {
      getTransactionsByEmailUseCase.execute.mockResolvedValue(Result.ok([]));

      const result = await controller.getTransactionsByEmail('notfound@example.com');

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when use case fails', async () => {
      getTransactionsByEmailUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Error retrieving transactions')),
      );

      await expect(controller.getTransactionsByEmail('test@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
