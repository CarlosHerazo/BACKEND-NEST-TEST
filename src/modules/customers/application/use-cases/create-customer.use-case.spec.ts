import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { ICustomerRepository, CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository.port';
import { Result } from '../../../../shared/domain/result';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../dtos/create-customer.dto';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
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
      existsByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: CUSTOMER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    repository = module.get(CUSTOMER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDto: CreateCustomerDto = {
      email: 'test@example.com',
      fullName: 'John Doe',
      phone: '+573001234567',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      country: 'Colombia',
      postalCode: '110111',
    };

    it('should create a customer successfully', async () => {
      repository.existsByEmail.mockResolvedValue(Result.ok(false));
      repository.create.mockResolvedValue(Result.ok(mockCustomer));

      const result = await useCase.execute(validDto);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().email).toBe('test@example.com');
      expect(repository.existsByEmail).toHaveBeenCalledWith('test@example.com');
      expect(repository.create).toHaveBeenCalled();
    });

    it('should fail if email is invalid', async () => {
      const invalidDto = { ...validDto, email: 'invalid-email' };

      const result = await useCase.execute(invalidDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid email format');
      expect(repository.existsByEmail).not.toHaveBeenCalled();
    });

    it('should fail if phone is invalid', async () => {
      const invalidDto = { ...validDto, phone: '123' };

      const result = await useCase.execute(invalidDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid phone format');
      expect(repository.existsByEmail).not.toHaveBeenCalled();
    });

    it('should fail if customer already exists', async () => {
      repository.existsByEmail.mockResolvedValue(Result.ok(true));

      const result = await useCase.execute(validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should fail if repository existsByEmail fails', async () => {
      repository.existsByEmail.mockResolvedValue(Result.fail(new Error('Database error')));

      const result = await useCase.execute(validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database error');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should fail if repository create fails', async () => {
      repository.existsByEmail.mockResolvedValue(Result.ok(false));
      repository.create.mockResolvedValue(Result.fail(new Error('Create failed')));

      const result = await useCase.execute(validDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Create failed');
    });
  });
});
