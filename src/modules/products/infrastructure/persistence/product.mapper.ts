import { Product } from '../../domain/entities/product.entity';
import { ProductSchema } from './product.schema';

export class ProductMapper {
  /**
   * Domain → Persistence
   */
  static toSchema(product: Product): ProductSchema {
    const schema = new ProductSchema();

    schema.id = product.id;
    schema.name = product.name;
    schema.description = product.description;
    schema.imgUrl = product.imgUrl;
    schema.price = product.price;
    schema.stock = product.stock;
    schema.createdAt = product.createdAt;
    schema.updatedAt = product.updatedAt;

    return schema;
  }

  /**
   * Persistence → Domain
   */
  static toDomain(schema: ProductSchema): Product {
    return new Product(
      schema.id,
      schema.name,
      schema.description,
      schema.imgUrl,
      Number(schema.price),
      schema.stock,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}
