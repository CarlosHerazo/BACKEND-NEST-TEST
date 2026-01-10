import { Result } from "../../../../shared/domain/result";
import { Product } from "../entities/product.entity";
// Product Repository Port (Interface)
// Defines the contract for product persistence operations

export interface IProductRepository {
  create(product: Product): Promise<Result<Product, Error>>;
  findById(id: string): Promise<Result<Product, Error>>;
  findAll(): Promise<Result<Product[], Error>>;
  update(product: Product): Promise<Result<Product, Error>>;
}