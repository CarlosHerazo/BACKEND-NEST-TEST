import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepositoryAdapter } from './customer.repository.adapter';
import { CustomerSchema } from '../persistence/customer.schema';
import { Customer } from '../../domain/entities/customer.entity';

describe('CustomerRepositoryAdapter', () => {
  let adapter: CustomerRepositoryAdapter;
  let repository: jest.Mocked<Repository<CustomerSchema>>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockCustomerSchema: CustomerSchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    fullName: 'John Doe',
    phone: '+573001234567',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    country: 'Colombia',
    postalCode: '110111',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockCustomer = new Customer(
    mockCustomerSchema.id,
    mockCustomerSchema.email,
    mockCustomerSchema.fullName,
    mockCustomerSchema.phone,
    mockCustomerSchema.address,
    mockCustomerSchema.city,
    mockCustomerSchema.country,
    mockCustomerSchema.postalCode,
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepositoryAdapter,
        {
          provide: getRepositoryToken(CustomerSchema),
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<CustomerRepositoryAdapter>(CustomerRepositoryAdapter);
    repository = module.get(getRepositoryToken(CustomerSchema));
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      repository.save.mockResolvedValue(mockCustomerSchema);

      const result = await adapter.create(mockCustomer);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockCustomerSchema.id);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should return failure when save throws error', async () => {
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.create(mockCustomer);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to create customer');
    });
  });

  describe('findById', () => {
    it('should find a customer by id', async () => {
      repository.findOne.mockResolvedValue(mockCustomerSchema);

      const result = await adapter.findById(mockCustomerSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockCustomerSchema.id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: mockCustomerSchema.id } });
    });

    it('should return failure when customer not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Customer not found');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findById(mockCustomerSchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find customer');
    });
  });

  describe('findByEmail', () => {
    it('should find a customer by email', async () => {
      repository.findOne.mockResolvedValue(mockCustomerSchema);

      const result = await adapter.findByEmail(mockCustomerSchema.email);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().email).toBe(mockCustomerSchema.email);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: mockCustomerSchema.email } });
    });

    it('should return failure when customer not found by email', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.findByEmail('notfound@example.com');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Customer not found with email');
    });

    it('should return failure when findOne throws error', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findByEmail(mockCustomerSchema.email);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to find customer');
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      repository.find.mockResolvedValue([mockCustomerSchema]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });

    it('should return empty array when no customers exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should return failure when find throws error', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      const result = await adapter.findAll();

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to retrieve customers');
    });
  });

  describe('update', () => {
    it('should update a customer successfully', async () => {
      repository.findOne.mockResolvedValue(mockCustomerSchema);
      repository.save.mockResolvedValue(mockCustomerSchema);

      const result = await adapter.update(mockCustomer);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(mockCustomerSchema.id);
    });

    it('should return failure when customer not found for update', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await adapter.update(mockCustomer);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Customer not found');
    });

    it('should return failure when save throws error', async () => {
      repository.findOne.mockResolvedValue(mockCustomerSchema);
      repository.save.mockRejectedValue(new Error('Database error'));

      const result = await adapter.update(mockCustomer);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to update customer');
    });
  });

  describe('delete', () => {
    it('should delete a customer successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await adapter.delete(mockCustomerSchema.id);

      expect(result.isSuccess).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith(mockCustomerSchema.id);
    });

    it('should return failure when customer not found for deletion', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      const result = await adapter.delete('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Customer not found');
    });

    it('should return failure when delete throws error', async () => {
      repository.delete.mockRejectedValue(new Error('Database error'));

      const result = await adapter.delete(mockCustomerSchema.id);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to delete customer');
    });
  });

  describe('existsByEmail', () => {
    it('should return true when customer exists', async () => {
      repository.count.mockResolvedValue(1);

      const result = await adapter.existsByEmail(mockCustomerSchema.email);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
      expect(repository.count).toHaveBeenCalledWith({ where: { email: mockCustomerSchema.email } });
    });

    it('should return false when customer does not exist', async () => {
      repository.count.mockResolvedValue(0);

      const result = await adapter.existsByEmail('notfound@example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });

    it('should return failure when count throws error', async () => {
      repository.count.mockRejectedValue(new Error('Database error'));

      const result = await adapter.existsByEmail(mockCustomerSchema.email);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Failed to check customer existence');
    });
  });
});
