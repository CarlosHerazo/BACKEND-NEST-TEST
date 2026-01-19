import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCustomerUseCase } from './delete-customer.use-case';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Result } from '../../../../shared/domain/result';

describe('DeleteCustomerUseCase', () => {
  let useCase: DeleteCustomerUseCase;
  let customerRepository: jest.Mocked<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteCustomerUseCase>(DeleteCustomerUseCase);
    customerRepository = module.get(CUSTOMER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a customer successfully', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      customerRepository.delete.mockResolvedValue(Result.ok(undefined));

      const result = await useCase.execute(customerId);

      expect(result.isSuccess).toBe(true);
      expect(customerRepository.delete).toHaveBeenCalledWith(customerId);
    });

    it('should fail when customer not found', async () => {
      const customerId = 'non-existent-id';
      customerRepository.delete.mockResolvedValue(
        Result.fail(new Error('Customer not found')),
      );

      const result = await useCase.execute(customerId);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer not found');
    });

    it('should fail when id is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer ID is required');
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when id is null', async () => {
      const result = await useCase.execute(null as any);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer ID is required');
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when id is whitespace only', async () => {
      const result = await useCase.execute('   ');

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer ID is required');
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when repository throws error', async () => {
      const customerId = '123e4567-e89b-12d3-a456-426614174000';
      customerRepository.delete.mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const result = await useCase.execute(customerId);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });
  });
});
