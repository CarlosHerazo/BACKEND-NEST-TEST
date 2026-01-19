import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRepositoryAdapter } from './delivery.repository.adapter';
import { DeliverySchema } from './delivery.schema';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

describe('DeliveryRepositoryAdapter', () => {
  let adapter: DeliveryRepositoryAdapter;
  let repository: jest.Mocked<Repository<DeliverySchema>>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockDeliverySchema: DeliverySchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    transactionId: 'transaction-123',
    customerName: 'John Doe',
    customerPhone: '+573001234567',
    addressLine1: 'Calle 123 #45-67',
    addressLine2: 'Apt 101',
    city: 'Bogotá',
    region: 'Cundinamarca',
    country: 'CO',
    postalCode: '110111',
    status: DeliveryStatus.PENDING,
    trackingNumber: 'TRACK-123',
    estimatedDeliveryDate: mockDate,
    actualDeliveryDate: undefined,
    notes: 'Test delivery',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockDelivery = Delivery.fromPersistence({
    id: mockDeliverySchema.id,
    transactionId: mockDeliverySchema.transactionId,
    customerName: mockDeliverySchema.customerName,
    customerPhone: mockDeliverySchema.customerPhone,
    address: {
      addressLine1: mockDeliverySchema.addressLine1,
      addressLine2: mockDeliverySchema.addressLine2,
      city: mockDeliverySchema.city,
      region: mockDeliverySchema.region,
      country: mockDeliverySchema.country,
      postalCode: mockDeliverySchema.postalCode,
    },
    status: mockDeliverySchema.status,
    trackingNumber: mockDeliverySchema.trackingNumber,
    estimatedDeliveryDate: mockDeliverySchema.estimatedDeliveryDate,
    actualDeliveryDate: mockDeliverySchema.actualDeliveryDate,
    notes: mockDeliverySchema.notes,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryRepositoryAdapter,
        {
          provide: getRepositoryToken(DeliverySchema),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<DeliveryRepositoryAdapter>(DeliveryRepositoryAdapter);
    repository = module.get(getRepositoryToken(DeliverySchema));
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('create', () => {
    it('should create a delivery successfully', async () => {
      repository.save.mockResolvedValue(mockDeliverySchema);

      const result = await adapter.create(mockDelivery);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockDeliverySchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.create(mockDelivery);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create delivery');
    });
  });

  describe('findById', () => {
    it('should find a delivery by id', async () => {
      repository.findOne.mockResolvedValue(mockDeliverySchema);

      const result = await adapter.findById(mockDeliverySchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockDeliverySchema.id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockDeliverySchema.id } });
    });

    it('should return failure when delivery not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Delivery with id');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findById(mockDeliverySchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find delivery');
    });
  });

  describe('findByTransactionId', () => {
    it('should find a delivery by transaction id', async () => {
      repository.findOne.mockResolvedValue(mockDeliverySchema);

      const result = await adapter.findByTransactionId(mockDeliverySchema.transactionId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().transactionId).toBe(mockDeliverySchema.transactionId);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { transactionId: mockDeliverySchema.transactionId } });
    });

    it('should return failure when delivery not found by transaction id', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findByTransactionId('non-existent-transaction');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Delivery for transaction');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findByTransactionId(mockDeliverySchema.transactionId);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find delivery');
    });
  });

  describe('update', () => {
    it('should update a delivery successfully', async () => {
      repository.save.mockResolvedValue(mockDeliverySchema);

      const result = await adapter.update(mockDelivery);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockDeliverySchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.update(mockDelivery);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to update delivery');
    });
  });
});
