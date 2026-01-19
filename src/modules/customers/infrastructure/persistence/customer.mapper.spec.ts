import { CustomerMapper } from './customer.mapper';
import { CustomerSchema } from './customer.schema';
import { Customer } from '../../domain/entities/customer.entity';

describe('CustomerMapper', () => {
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

  describe('toDomain', () => {
    it('should map CustomerSchema to Customer domain entity', () => {
      const result = CustomerMapper.toDomain(mockCustomerSchema);

      expect(result).toBeInstanceOf(Customer);
      expect(result.id).toBe(mockCustomerSchema.id);
      expect(result.email).toBe(mockCustomerSchema.email);
      expect(result.fullName).toBe(mockCustomerSchema.fullName);
      expect(result.phone).toBe(mockCustomerSchema.phone);
      expect(result.address).toBe(mockCustomerSchema.address);
      expect(result.city).toBe(mockCustomerSchema.city);
      expect(result.country).toBe(mockCustomerSchema.country);
      expect(result.postalCode).toBe(mockCustomerSchema.postalCode);
      expect(result.createdAt).toEqual(mockCustomerSchema.createdAt);
      expect(result.updatedAt).toEqual(mockCustomerSchema.updatedAt);
    });
  });

  describe('toSchema', () => {
    it('should map Customer domain entity to CustomerSchema', () => {
      const result = CustomerMapper.toSchema(mockCustomer);

      expect(result).toBeInstanceOf(CustomerSchema);
      expect(result.id).toBe(mockCustomer.id);
      expect(result.email).toBe(mockCustomer.email);
      expect(result.fullName).toBe(mockCustomer.fullName);
      expect(result.phone).toBe(mockCustomer.phone);
      expect(result.address).toBe(mockCustomer.address);
      expect(result.city).toBe(mockCustomer.city);
      expect(result.country).toBe(mockCustomer.country);
      expect(result.postalCode).toBe(mockCustomer.postalCode);
      expect(result.createdAt).toEqual(mockCustomer.createdAt);
      expect(result.updatedAt).toEqual(mockCustomer.updatedAt);
    });
  });

  describe('bidirectional mapping', () => {
    it('should preserve data when mapping schema -> domain -> schema', () => {
      const domain = CustomerMapper.toDomain(mockCustomerSchema);
      const schema = CustomerMapper.toSchema(domain);

      expect(schema.id).toBe(mockCustomerSchema.id);
      expect(schema.email).toBe(mockCustomerSchema.email);
      expect(schema.fullName).toBe(mockCustomerSchema.fullName);
      expect(schema.phone).toBe(mockCustomerSchema.phone);
      expect(schema.address).toBe(mockCustomerSchema.address);
      expect(schema.city).toBe(mockCustomerSchema.city);
      expect(schema.country).toBe(mockCustomerSchema.country);
      expect(schema.postalCode).toBe(mockCustomerSchema.postalCode);
    });

    it('should preserve data when mapping domain -> schema -> domain', () => {
      const schema = CustomerMapper.toSchema(mockCustomer);
      const domain = CustomerMapper.toDomain(schema);

      expect(domain.id).toBe(mockCustomer.id);
      expect(domain.email).toBe(mockCustomer.email);
      expect(domain.fullName).toBe(mockCustomer.fullName);
      expect(domain.phone).toBe(mockCustomer.phone);
      expect(domain.address).toBe(mockCustomer.address);
      expect(domain.city).toBe(mockCustomer.city);
      expect(domain.country).toBe(mockCustomer.country);
      expect(domain.postalCode).toBe(mockCustomer.postalCode);
    });
  });
});
