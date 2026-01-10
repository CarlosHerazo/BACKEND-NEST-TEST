import { Customer } from '../../domain/entities/customer.entity';
import { CustomerSchema } from './customer.schema';

/**
 * Mapper between domain entity and database schema
 */
export class CustomerMapper {
  /**
   * Maps database schema to domain entity
   */
  static toDomain(schema: CustomerSchema): Customer {
    return new Customer(
      schema.id,
      schema.email,
      schema.fullName,
      schema.phone,
      schema.address,
      schema.city,
      schema.country,
      schema.postalCode,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  /**
   * Maps domain entity to database schema
   */
  static toSchema(customer: Customer): CustomerSchema {
    const schema = new CustomerSchema();
    schema.id = customer.id;
    schema.email = customer.email;
    schema.fullName = customer.fullName;
    schema.phone = customer.phone;
    schema.address = customer.address;
    schema.city = customer.city;
    schema.country = customer.country;
    schema.postalCode = customer.postalCode;
    schema.createdAt = customer.createdAt;
    schema.updatedAt = customer.updatedAt;
    return schema;
  }
}
