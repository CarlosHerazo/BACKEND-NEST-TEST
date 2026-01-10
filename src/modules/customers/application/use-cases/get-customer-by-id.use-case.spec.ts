import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerByIdUseCase } from './get-customer-by-id.use-case';
import { ICustomerRepository, CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Customer } from '../../domain/entities/customer.entity';

describe('GetCustomerByIdUseCase', () => {
  let useCase: GetCustomerByIdUseCase;
  let repository: jest.Mocked<ICustomerRepository>;

  const mockCustomer = new Customer(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'John Doe',
    '+573001234567',
    'Calle 123 #45-67',
    'Bogotá',
    'Colombia',
    '110111',
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: Partial<jest.Mocked<ICustomerRepository>> = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerByIdUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCustomerByIdUseCase>(GetCustomerByIdUseCase);
    repository = module.get(CUSTOMER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return customer when found', async () => {
      repository.findById.mockResolvedValue(Result.ok(mockCustomer));

      const result = await useCase.execute('123e4567-e89b-12d3-a456-426614174000');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(mockCustomer);
      expect(repository.findById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should fail when customer not found', async () => {
      repository.findById.mockResolvedValue(Result.fail(new Error('Customer not found')));

      const result = await useCase.execute('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer not found');
    });

    it('should fail when id is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Customer ID is required');
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should fail when repository throws error', async () => {
      repository.findById.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute('123');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });
  });
});
