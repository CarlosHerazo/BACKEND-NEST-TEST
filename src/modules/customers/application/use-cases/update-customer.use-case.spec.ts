import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomerUseCase } from './update-customer.use-case';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../../../shared/domain/result';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;
  let customerRepository: jest.Mocked<any>;

  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockCustomer = new Customer(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'John Doe',
    '+573001234567',
    'Calle 123 #45-67',
    'Bogotá',
    'Colombia',
    '110111',
    mockDate,
    mockDate,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            existsByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
    customerRepository = module.get(CUSTOMER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update customer name successfully', async () => {
      const dto: UpdateCustomerDto = { fullName: 'Jane Doe' };
      const updatedCustomer = mockCustomer.update(dto);

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.update.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().fullName).toBe('Jane Doe');
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomer.id);
      expect(customerRepository.update).toHaveBeenCalled();
    });

    it('should update customer phone successfully', async () => {
      const dto: UpdateCustomerDto = { phone: '+573009876543' };
      const updatedCustomer = mockCustomer.update(dto);

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.update.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isSuccess).toBe(true);
    });

    it('should update customer email and check for duplicates', async () => {
      const dto: UpdateCustomerDto = { email: 'newemail@example.com' };
      const updatedCustomer = mockCustomer.update(dto);

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.existsByEmail.mockResolvedValue(Result.ok(false));
      customerRepository.update.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isSuccess).toBe(true);
      expect(customerRepository.existsByEmail).toHaveBeenCalledWith('newemail@example.com');
    });

    it('should fail when new email already exists', async () => {
      const dto: UpdateCustomerDto = { email: 'existing@example.com' };

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.existsByEmail.mockResolvedValue(Result.ok(true));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('already exists');
      expect(customerRepository.update).not.toHaveBeenCalled();
    });

    it('should not check email existence if email is unchanged', async () => {
      const dto: UpdateCustomerDto = { email: 'test@example.com', fullName: 'Jane Doe' };
      const updatedCustomer = mockCustomer.update(dto);

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.update.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isSuccess).toBe(true);
      expect(customerRepository.existsByEmail).not.toHaveBeenCalled();
    });

    it('should fail when customer not found', async () => {
      const dto: UpdateCustomerDto = { fullName: 'Jane Doe' };

      customerRepository.findById.mockResolvedValue(
        Result.fail(new Error('Customer not found')),
      );

      const result = await useCase.execute('non-existent-id', dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Customer not found');
    });

    it('should fail when email format is invalid', async () => {
      const dto: UpdateCustomerDto = { email: 'invalid-email' };

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid email');
      expect(customerRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when phone format is invalid', async () => {
      const dto: UpdateCustomerDto = { phone: '123' };

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid phone');
      expect(customerRepository.findById).not.toHaveBeenCalled();
    });

    it('should fail when existsByEmail check fails', async () => {
      const dto: UpdateCustomerDto = { email: 'newemail@example.com' };

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.existsByEmail.mockResolvedValue(
        Result.fail(new Error('Database error')),
      );

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
    });

    it('should fail when repository update fails', async () => {
      const dto: UpdateCustomerDto = { fullName: 'Jane Doe' };

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.update.mockResolvedValue(
        Result.fail(new Error('Update failed')),
      );

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Update failed');
    });

    it('should update multiple fields at once', async () => {
      const dto: UpdateCustomerDto = {
        fullName: 'Jane Doe',
        phone: '+573009876543',
        address: 'Calle Nueva 456',
        city: 'Medellín',
      };
      const updatedCustomer = mockCustomer.update(dto);

      customerRepository.findById.mockResolvedValue(Result.ok(mockCustomer));
      customerRepository.update.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await useCase.execute(mockCustomer.id, dto);

      expect(result.isSuccess).toBe(true);
      expect(customerRepository.update).toHaveBeenCalled();
    });
  });
});
