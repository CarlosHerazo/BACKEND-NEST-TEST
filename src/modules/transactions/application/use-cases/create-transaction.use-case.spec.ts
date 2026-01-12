import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository.port';
import { WompiIntegrationService } from '../services/wompi-integration.service';
import { Result } from '../../../../shared/domain/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: any;
  let mockWompiIntegrationService: any;

  const mockDto: CreateTransactionDto = {
    customerId: 'customer-123',
    customerEmail: 'test@example.com',
    amountInCents: 5000000,
    currency: 'COP',
    reference: 'ORDER-12345',
    acceptanceToken: 'acceptance-token-123',
    acceptPersonalAuth: 'personal-auth-123',
    paymentMethod: {
      type: 'CARD',
      token: 'card-token-123',
      installments: 1,
    },
    customerFullName: 'John Doe',
    customerPhoneNumber: '+573001234567',
  };

  beforeEach(async () => {
    mockTransactionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByReference: jest.fn(),
    };

    mockWompiIntegrationService = {
      createTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: WompiIntegrationService,
          useValue: mockWompiIntegrationService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a transaction successfully', async () => {
      const mockTransaction = Transaction.create(
        'transaction-123',
        mockDto.customerId,
        mockDto.customerEmail,
        mockDto.amountInCents,
        mockDto.currency,
        mockDto.reference,
        mockDto.acceptanceToken,
        mockDto.acceptPersonalAuth,
        mockDto.paymentMethod,
        mockDto.customerFullName,
        mockDto.customerPhoneNumber,
      );

      const wompiResult = {
        wompiTransactionId: 'wompi-123',
        redirectUrl: 'https://checkout.wompi.co/l/NmKVrC',
        paymentLinkId: '12345',
      };

      mockTransactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
      mockWompiIntegrationService.createTransaction.mockResolvedValue(wompiResult);
      mockTransactionRepository.update.mockResolvedValue(
        Result.ok(
          mockTransaction.updateStatus(
            TransactionStatus.PENDING,
            wompiResult.wompiTransactionId,
            wompiResult.redirectUrl,
            wompiResult.paymentLinkId,
          ),
        ),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      expect(mockTransactionRepository.create).toHaveBeenCalledTimes(1);
      expect(mockWompiIntegrationService.createTransaction).toHaveBeenCalledWith(mockDto);
      expect(mockTransactionRepository.update).toHaveBeenCalledTimes(1);

      const updatedTransaction = result.getValue();
      expect(updatedTransaction.wompiTransactionId).toBe('wompi-123');
      expect(updatedTransaction.redirectUrl).toBe('https://checkout.wompi.co/l/NmKVrC');
    });

    it('should fail when repository create fails', async () => {
      const error = new Error('Database error');
      mockTransactionRepository.create.mockResolvedValue(Result.fail(error));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
      expect(mockWompiIntegrationService.createTransaction).not.toHaveBeenCalled();
    });

    it('should update transaction to ERROR when Wompi fails', async () => {
      const mockTransaction = Transaction.create(
        'transaction-123',
        mockDto.customerId,
        mockDto.customerEmail,
        mockDto.amountInCents,
        mockDto.currency,
        mockDto.reference,
        mockDto.acceptanceToken,
        mockDto.acceptPersonalAuth,
        mockDto.paymentMethod,
      );

      const wompiError = new Error('Invalid card number');

      mockTransactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
      mockWompiIntegrationService.createTransaction.mockRejectedValue(wompiError);
      mockTransactionRepository.update.mockResolvedValue(Result.ok(mockTransaction));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create transaction in Wompi');
      expect(result.getError().message).toContain('Invalid card number');

      // Verify that update was called to set ERROR status
      expect(mockTransactionRepository.update).toHaveBeenCalledTimes(1);
      const updateCall = mockTransactionRepository.update.mock.calls[0][0];
      expect(updateCall.status).toBe(TransactionStatus.ERROR);
      expect(updateCall.errorMessage).toBe('Wompi error: Invalid card number');
    });

    it('should handle Wompi error with detailed error message', async () => {
      const mockTransaction = Transaction.create(
        'transaction-123',
        mockDto.customerId,
        mockDto.customerEmail,
        mockDto.amountInCents,
        mockDto.currency,
        mockDto.reference,
        mockDto.acceptanceToken,
        mockDto.acceptPersonalAuth,
        mockDto.paymentMethod,
      );

      const wompiError = new Error('Insufficient funds');

      mockTransactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
      mockWompiIntegrationService.createTransaction.mockRejectedValue(wompiError);
      mockTransactionRepository.update.mockResolvedValue(Result.ok(mockTransaction));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);

      const updateCall = mockTransactionRepository.update.mock.calls[0][0];
      expect(updateCall.errorMessage).toBe('Wompi error: Insufficient funds');
    });

    it('should create transaction without optional fields', async () => {
      const minimalDto: CreateTransactionDto = {
        customerId: 'customer-123',
        customerEmail: 'test@example.com',
        amountInCents: 5000000,
        currency: 'COP',
        reference: 'ORDER-12345',
        acceptanceToken: 'acceptance-token-123',
        acceptPersonalAuth: 'personal-auth-123',
        paymentMethod: {
          type: 'CARD',
          token: 'card-token-123',
        },
      };

      const mockTransaction = Transaction.create(
        'transaction-123',
        minimalDto.customerId,
        minimalDto.customerEmail,
        minimalDto.amountInCents,
        minimalDto.currency,
        minimalDto.reference,
        minimalDto.acceptanceToken,
        minimalDto.acceptPersonalAuth,
        minimalDto.paymentMethod,
      );

      const wompiResult = {
        wompiTransactionId: 'wompi-123',
      };

      mockTransactionRepository.create.mockResolvedValue(Result.ok(mockTransaction));
      mockWompiIntegrationService.createTransaction.mockResolvedValue(wompiResult);
      mockTransactionRepository.update.mockResolvedValue(Result.ok(mockTransaction));

      const result = await useCase.execute(minimalDto);

      expect(result.isSuccess).toBe(true);
      expect(mockTransactionRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle generic errors gracefully', async () => {
      const error = new Error('Unexpected error');
      mockTransactionRepository.create.mockRejectedValue(error);

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create transaction');
    });
  });
});
