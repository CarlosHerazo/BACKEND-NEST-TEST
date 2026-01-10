import { Customer } from '../entities/customer.entity';
import { Result } from '../../../../shared/domain/result';

/**
 * Customer Repository Port (Interface)
 * Defines the contract for customer persistence operations
 */
export interface ICustomerRepository {
  /**
   * Creates a new customer
   */
  create(customer: Customer): Promise<Result<Customer, Error>>;

  /**
   * Finds a customer by ID
   */
  findById(id: string): Promise<Result<Customer, Error>>;

  /**
   * Finds a customer by email
   */
  findByEmail(email: string): Promise<Result<Customer, Error>>;

  /**
   * Finds all customers
   */
  findAll(): Promise<Result<Customer[], Error>>;

  /**
   * Updates an existing customer
   */
  update(customer: Customer): Promise<Result<Customer, Error>>;

  /**
   * Deletes a customer by ID
   */
  delete(id: string): Promise<Result<void, Error>>;

  /**
   * Checks if a customer exists by email
   */
  existsByEmail(email: string): Promise<Result<boolean, Error>>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
