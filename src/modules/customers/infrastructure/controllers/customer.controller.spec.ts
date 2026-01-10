import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from '../../application/use-cases/get-customer-by-id.use-case';
import { GetCustomerByEmailUseCase } from '../../application/use-cases/get-customer-by-email.use-case';
import { GetAllCustomersUseCase } from '../../application/use-cases/get-all-customers.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from '../../application/use-cases/delete-customer.use-case';
import { Result } from '../../../../shared/domain/result';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';

describe('CustomerController', () => {
  let controller: CustomerController;
  let createCustomerUseCase: jest.Mocked<CreateCustomerUseCase>;
  let getCustomerByIdUseCase: jest.Mocked<GetCustomerByIdUseCase>;
  let getCustomerByEmailUseCase: jest.Mocked<GetCustomerByEmailUseCase>;
  let getAllCustomersUseCase: jest.Mocked<GetAllCustomersUseCase>;
  let updateCustomerUseCase: jest.Mocked<UpdateCustomerUseCase>;
  let deleteCustomerUseCase: jest.Mocked<DeleteCustomerUseCase>;

  const mockCustomer = new Customer(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'John Doe',
    '+573001234567',
    'Calle 123 #45-67',
    'Bogotá',
    'Colombia',
    '110111',
    new Date('2024-01-09T10:00:00Z'),
    new Date('2024-01-09T10:00:00Z'),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CreateCustomerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCustomerByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCustomerByEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetAllCustomersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateCustomerUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteCustomerUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    createCustomerUseCase = module.get(CreateCustomerUseCase);
    getCustomerByIdUseCase = module.get(GetCustomerByIdUseCase);
    getCustomerByEmailUseCase = module.get(GetCustomerByEmailUseCase);
    getAllCustomersUseCase = module.get(GetAllCustomersUseCase);
    updateCustomerUseCase = module.get(UpdateCustomerUseCase);
    deleteCustomerUseCase = module.get(DeleteCustomerUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const dto: CreateCustomerDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        country: 'Colombia',
        postalCode: '110111',
      };

      createCustomerUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

      const result = await controller.createCustomer(dto);

      expect(result.id).toBe(mockCustomer.id);
      expect(result.email).toBe(mockCustomer.email);
      expect(createCustomerUseCase.execute).toHaveBeenCalledWith(dto);
    });

    it('should throw error when creation fails', async () => {
      const dto: CreateCustomerDto = {
        email: 'test@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        country: 'Colombia',
        postalCode: '110111',
      };

      createCustomerUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Customer already exists')),
      );

      await expect(controller.createCustomer(dto)).rejects.toThrow('Customer already exists');
    });
  });

  describe('getCustomerById', () => {
    it('should return a customer by id', async () => {
      getCustomerByIdUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

      const result = await controller.getCustomerById('123e4567-e89b-12d3-a456-426614174000');

      expect(result.id).toBe(mockCustomer.id);
      expect(getCustomerByIdUseCase.execute).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error when customer not found', async () => {
      getCustomerByIdUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Customer not found')),
      );

      await expect(controller.getCustomerById('non-existent-id')).rejects.toThrow(
        'Customer not found',
      );
    });
  });

  describe('getCustomers', () => {
    it('should return all customers when no email provided', async () => {
      getAllCustomersUseCase.execute.mockResolvedValue(Result.ok([mockCustomer]));

      const result = await controller.getCustomers();

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(1);
      expect(getAllCustomersUseCase.execute).toHaveBeenCalled();
    });

    it('should return customer by email when email provided', async () => {
      getCustomerByEmailUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

      const result = await controller.getCustomers('test@example.com');

      expect((result as any).id).toBe(mockCustomer.id);
      expect(getCustomerByEmailUseCase.execute).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer successfully', async () => {
      const dto: UpdateCustomerDto = {
        fullName: 'Jane Doe',
        phone: '+573009876543',
      };

      const updatedCustomer = mockCustomer.update(dto);
      updateCustomerUseCase.execute.mockResolvedValue(Result.ok(updatedCustomer));

      const result = await controller.updateCustomer('123e4567-e89b-12d3-a456-426614174000', dto);

      expect(result.id).toBe(mockCustomer.id);
      expect(updateCustomerUseCase.execute).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        dto,
      );
    });

    it('should throw error when update fails', async () => {
      const dto: UpdateCustomerDto = { fullName: 'Jane Doe' };

      updateCustomerUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Customer not found')),
      );

      await expect(
        controller.updateCustomer('non-existent-id', dto),
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer successfully', async () => {
      deleteCustomerUseCase.execute.mockResolvedValue(Result.ok(undefined));

      await controller.deleteCustomer('123e4567-e89b-12d3-a456-426614174000');

      expect(deleteCustomerUseCase.execute).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
      );
    });

    it('should throw error when deletion fails', async () => {
      deleteCustomerUseCase.execute.mockResolvedValue(
        Result.fail(new Error('Customer not found')),
      );

      await expect(controller.deleteCustomer('non-existent-id')).rejects.toThrow(
        'Customer not found',
      );
    });
  });
});
