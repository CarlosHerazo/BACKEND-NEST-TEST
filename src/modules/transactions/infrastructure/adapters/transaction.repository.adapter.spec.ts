import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryAdapter } from './transaction.repository.adapter';
import { TransactionSchema } from '../persistence/transaction.schema';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('TransactionRepositoryAdapter', () => {
  let adapter: TransactionRepositoryAdapter;
  let repository: jest.Mocked<Repository<TransactionSchema>>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockTransactionSchema: TransactionSchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    customerId: 'customer-123',
    customerEmail: 'test@example.com',
    amountInCents: 100000,
    currency: 'COP',
    status: TransactionStatus.PENDING,
    reference: 'ORDER-123456',
    acceptanceToken: 'acceptance-token',
    acceptPersonalAuth: 'personal-auth-token',
    paymentMethod: { type: 'CARD' },
    wompiTransactionId: 'wompi-123',
    redirectUrl: 'https://example.com/redirect',
    paymentLinkId: 'link-123',
    customerFullName: 'John Doe',
    customerPhoneNumber: '+573001234567',
    shippingAddress: { city: 'Bogotá', address: 'Calle 123' },
    metadata: { orderId: '123' },
    errorMessage: undefined,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockTransaction = new Transaction(
    mockTransactionSchema.id,
    mockTransactionSchema.customerId,
    mockTransactionSchema.customerEmail,
    mockTransactionSchema.amountInCents,
    mockTransactionSchema.currency,
    mockTransactionSchema.status,
    mockTransactionSchema.reference,
    mockTransactionSchema.acceptanceToken,
    mockTransactionSchema.acceptPersonalAuth,
    mockTransactionSchema.paymentMethod,
    mockTransactionSchema.wompiTransactionId,
    mockTransactionSchema.redirectUrl,
    mockTransactionSchema.paymentLinkId,
    mockTransactionSchema.customerFullName,
    mockTransactionSchema.customerPhoneNumber,
    mockTransactionSchema.shippingAddress,
    mockTransactionSchema.metadata,
    mockTransactionSchema.errorMessage,
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepositoryAdapter,
        {
          provide: getRepositoryToken(TransactionSchema),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<TransactionRepositoryAdapter>(TransactionRepositoryAdapter);
    repository = module.get(getRepositoryToken(TransactionSchema));
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      repository.save.mockResolvedValue(mockTransactionSchema);

      const result = await adapter.create(mockTransaction);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockTransactionSchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.create(mockTransaction);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create transaction');
    });
  });

  describe('findById', () => {
    it('should find a transaction by id', async () => {
      repository.findOne.mockResolvedValue(mockTransactionSchema);

      const result = await adapter.findById(mockTransactionSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockTransactionSchema.id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockTransactionSchema.id } });
    });

    it('should return failure when transaction not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Transaction not found');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findById(mockTransactionSchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find transaction');
    });
  });

  describe('findByReference', () => {
    it('should find a transaction by reference', async () => {
      repository.findOne.mockResolvedValue(mockTransactionSchema);

      const result = await adapter.findByReference(mockTransactionSchema.reference);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().reference).toBe(mockTransactionSchema.reference);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { reference: mockTransactionSchema.reference } });
    });

    it('should return failure when transaction not found by reference', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findByReference('non-existent-ref');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Transaction not found with reference');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findByReference(mockTransactionSchema.reference);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find transaction');
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      repository.find.mockResolvedValue([mockTransactionSchema]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });

    it('should return empty array when no transactions exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when find throws error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findAll();

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find transactions');
    });
  });

  describe('findByCustomerId', () => {
    it('should find transactions by customer id', async () => {
      repository.find.mockResolvedValue([mockTransactionSchema]);

      const result = await adapter.findByCustomerId(mockTransactionSchema.customerId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { customerId: mockTransactionSchema.customerId },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no transactions found for customer', async () => {
      repository.find.mockResolvedValue([]);

      const result = await adapter.findByCustomerId('non-existent-customer');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when find throws error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findByCustomerId(mockTransactionSchema.customerId);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find transactions');
    });
  });

  describe('findByCustomerEmail', () => {
    it('should find transactions by customer email', async () => {
      repository.find.mockResolvedValue([mockTransactionSchema]);

      const result = await adapter.findByCustomerEmail(mockTransactionSchema.customerEmail);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { customerEmail: mockTransactionSchema.customerEmail },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no transactions found for email', async () => {
      repository.find.mockResolvedValue([]);

      const result = await adapter.findByCustomerEmail('notfound@example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when find throws error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findByCustomerEmail(mockTransactionSchema.customerEmail);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find transactions');
    });
  });

  describe('update', () => {
    it('should update a transaction successfully', async () => {
      repository.save.mockResolvedValue(mockTransactionSchema);

      const result = await adapter.update(mockTransaction);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockTransactionSchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.update(mockTransaction);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to update transaction');
    });
  });

  describe('existsById', () => {
    it('should return true when transaction exists', async () => {
      repository.count.mockResolvedValue(1);

      const result = await adapter.existsById(mockTransactionSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
      expect(repository.count).toHaveBeenCalledWith({ where: { id: mockTransactionSchema.id } });
    });

    it('should return false when transaction does not exist', async () => {
      repository.count.mockResolvedValue(0);

      const result = await adapter.existsById('non-existent-id');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });

    it('should return failure when count throws error', async () => {
      repository.count.mockRejectedValue(new Error('Database error'));

      const result = await adapter.existsById(mockTransactionSchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to check transaction existence');
    });
  });
});
