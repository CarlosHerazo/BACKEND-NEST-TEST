import { Test, TestingModule } from '@nestjs/testing';
import { CreateDeliveryUseCase, CreateDeliveryInput } from './create-delivery.use-case';
import { IDeliveryRepository, DELIVERY_REPOSITORY } from '../../domain/ports/delivery.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

describe('CreateDeliveryUseCase', () => {
  let useCase: CreateDeliveryUseCase;
  let repository: jest.Mocked<IDeliveryRepository>;

  const mockDelivery = Delivery.fromPersistence({
    id: '123e4567-e89b-12d3-a456-426614174000',
    transactionId: 'transaction-123',
    customerName: 'John Doe',
    customerPhone: '+573001234567',
    address: {
      addressLine1: 'Calle 123 #45-67',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'CO',
      postalCode: '110111',
    },
    status: DeliveryStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<IDeliveryRepository>> = {
      findByTransactionId: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDeliveryUseCase,
        {
          provide: DELIVERY_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateDeliveryUseCase>(CreateDeliveryUseCase);
    repository = module.get(DELIVERY_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validInput: CreateDeliveryInput = {
      transactionId: 'transaction-123',
      customerName: 'John Doe',
      customerPhone: '+573001234567',
      address: {
        addressLine1: 'Calle 123 #45-67',
        city: 'Bogotá',
        region: 'Cundinamarca',
        country: 'CO',
        postalCode: '110111',
      },
      estimatedDeliveryDate: new Date(),
      notes: 'Handle with care',
    };

    it('should create a delivery successfully', async () => {
      repository.findByTransactionId.mockResolvedValue(Result.fail(new Error('Not found')));
      repository.create.mockResolvedValue(Result.ok(mockDelivery));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().transactionId).toBe('transaction-123');
      expect(repository.findByTransactionId).toHaveBeenCalledWith('transaction-123');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should fail if delivery already exists for transaction', async () => {
      repository.findByTransactionId.mockResolvedValue(Result.ok(mockDelivery));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should fail if repository create fails', async () => {
      repository.findByTransactionId.mockResolvedValue(Result.fail(new Error('Not found')));
      repository.create.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });

    it('should handle unexpected errors', async () => {
      repository.findByTransactionId.mockRejectedValue(new Error('Connection error'));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create delivery');
    });
  });
});
