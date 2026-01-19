import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCustomersUseCase } from './get-all-customers.use-case';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';

describe('GetAllCustomersUseCase', () => {
  let useCase: GetAllCustomersUseCase;
  let customerRepository: jest.Mocked<any>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockCustomers = [
    new Customer(
      '123e4567-e89b-12d3-a456-426614174000',
      'test1@example.com',
      'John Doe',
      '+573001234567',
      'Calle 123 #45-67',
      'Bogotá',
      'Colombia',
      '110111',
      mockDate,
      mockDate,
    ),
    new Customer(
      '223e4567-e89b-12d3-a456-426614174001',
      'test2@example.com',
      'Jane Doe',
      '+573009876543',
      'Calle 456 #78-90',
      'Medellín',
      'Colombia',
      '050001',
      mockDate,
      mockDate,
    ),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCustomersUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetAllCustomersUseCase>(GetAllCustomersUseCase);
    customerRepository = module.get(CUSTOMER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all customers successfully', async () => {
      customerRepository.findAll.mockResolvedValue(Result.ok(mockCustomers));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(2);
      expect(result.getValue()[0].email).toBe('test1@example.com');
      expect(result.getValue()[1].email).toBe('test2@example.com');
      expect(customerRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no customers exist', async () => {
      customerRepository.findAll.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toHaveLength(0);
    });

    it('should fail when repository throws error', async () => {
      customerRepository.findAll.mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const result = await useCase.execute();

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });

    it('should return customers with all their properties', async () => {
      customerRepository.findAll.mockResolvedValue(Result.ok([mockCustomers[0]]));

      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const customer = result.getValue()[0];
      expect(customer.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(customer.email).toBe('test1@example.com');
      expect(customer.fullName).toBe('John Doe');
      expect(customer.phone).toBe('+573001234567');
      expect(customer.address).toBe('Calle 123 #45-67');
      expect(customer.city).toBe('Bogotá');
      expect(customer.country).toBe('Colombia');
      expect(customer.postalCode).toBe('110111');
    });
  });
});
