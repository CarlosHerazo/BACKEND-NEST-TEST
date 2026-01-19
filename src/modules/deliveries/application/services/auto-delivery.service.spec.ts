import { Test, TestingModule } from '@nestjs/testing';
import { AutoDeliveryService } from './auto-delivery.service';
import { CreateDeliveryUseCase } from '../use-cases/create-delivery.use-case';
import { Transaction } from '../../../transactions/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../transactions/domain/enums/transaction-status.enum';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { Result } from '../../../../shared/domain/result';

describe('AutoDeliveryService', () => {
  let service: AutoDeliveryService;
  let createDeliveryUseCase: jest.Mocked<CreateDeliveryUseCase>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const createMockTransaction = (
    status: TransactionStatus,
    options?: {
      customerFullName?: string | null;
      customerPhoneNumber?: string | null;
      shippingAddress?: Record<string, any> | null;
    },
  ): Transaction => {
    const customerFullName = options?.customerFullName === null
      ? undefined
      : (options?.customerFullName ?? 'John Doe');
    const customerPhoneNumber = options?.customerPhoneNumber === null
      ? undefined
      : (options?.customerPhoneNumber ?? '+573001234567');
    const shippingAddress = options?.shippingAddress === null
      ? undefined
      : (options?.shippingAddress ?? {
          addressLine1: 'Calle 123',
          addressLine2: 'Apt 101',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'CO',
          postalCode: '110111',
        });

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
      customerFullName,
      customerPhoneNumber,
      shippingAddress,
      { orderId: '123' },
      undefined,
      mockDate,
      mockDate,
    );
  };

  const mockDelivery = Delivery.fromPersistence({
    id: 'delivery-123',
    transactionId: '123e4567-e89b-12d3-a456-426614174000',
    customerName: 'John Doe',
    customerPhone: '+573001234567',
    address: {
      addressLine1: 'Calle 123',
      addressLine2: 'Apt 101',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'CO',
      postalCode: '110111',
    },
    status: DeliveryStatus.PENDING,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoDeliveryService,
        {
          provide: CreateDeliveryUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AutoDeliveryService>(AutoDeliveryService);
    createDeliveryUseCase = module.get(CreateDeliveryUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDeliveryForTransaction', () => {
    it('should return null for non-approved transaction', async () => {
      const pendingTransaction = createMockTransaction(TransactionStatus.PENDING);

      const result = await service.createDeliveryForTransaction(pendingTransaction);

      expect(result).toBeNull();
      expect(createDeliveryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return null for declined transaction', async () => {
      const declinedTransaction = createMockTransaction(TransactionStatus.DECLINED);

      const result = await service.createDeliveryForTransaction(declinedTransaction);

      expect(result).toBeNull();
      expect(createDeliveryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return null when shipping address is missing', async () => {
      const transactionWithoutAddress = createMockTransaction(TransactionStatus.APPROVED, {
        shippingAddress: null,
      });

      const result = await service.createDeliveryForTransaction(transactionWithoutAddress);

      expect(result).toBeNull();
      expect(createDeliveryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return null when customer name is missing', async () => {
      const transactionWithoutName = createMockTransaction(TransactionStatus.APPROVED, {
        customerFullName: null,
      });

      const result = await service.createDeliveryForTransaction(transactionWithoutName);

      expect(result).toBeNull();
      expect(createDeliveryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return null when customer phone is missing', async () => {
      const transactionWithoutPhone = createMockTransaction(TransactionStatus.APPROVED, {
        customerPhoneNumber: null,
      });

      const result = await service.createDeliveryForTransaction(transactionWithoutPhone);

      expect(result).toBeNull();
      expect(createDeliveryUseCase.execute).not.toHaveBeenCalled();
    });

    it('should create delivery for approved transaction with all required data', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      createDeliveryUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

      const result = await service.createDeliveryForTransaction(approvedTransaction);

      expect(result).toBe('delivery-123');
      expect(createDeliveryUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: approvedTransaction.id,
          customerName: 'John Doe',
          customerPhone: '+573001234567',
          address: expect.objectContaining({
            addressLine1: 'Calle 123',
            city: 'Bogotá',
          }),
        }),
      );
    });

    it('should return null when delivery creation fails', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      createDeliveryUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Delivery creation failed')),
      );

      const result = await service.createDeliveryForTransaction(approvedTransaction);

      expect(result).toBeNull();
    });

    it('should return null when use case throws exception', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      createDeliveryUseCase.execute.mockRejectedValue(new Error('Unexpected error'));

      const result = await service.createDeliveryForTransaction(approvedTransaction);

      expect(result).toBeNull();
    });

    it('should include notes with transaction reference', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      createDeliveryUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

      await service.createDeliveryForTransaction(approvedTransaction);

      expect(createDeliveryUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: expect.stringContaining('ORDER-123456'),
        }),
      );
    });

    it('should set estimated delivery date to 7 days from now', async () => {
      const approvedTransaction = createMockTransaction(TransactionStatus.APPROVED);

      createDeliveryUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

      await service.createDeliveryForTransaction(approvedTransaction);

      expect(createDeliveryUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedDeliveryDate: expect.any(Date),
        }),
      );
    });
  });
});
