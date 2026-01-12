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
    schema.images = product.images;
    schema.price = product.price;
    schema.stock = product.stock;
    schema.category = product.category;
    schema.rating = product.rating;
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
      schema.images ?? null,
      Number(schema.price),
      schema.stock,
      schema.category ?? null,
      schema.rating ? Number(schema.rating) : null,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}
