import { DiscountCode } from '../../domain/entities/discount-code.entity';
import { DiscountCodeSchema } from './discount-code.schema';

export class DiscountCodeMapper {
  static toDomain(schema: DiscountCodeSchema): DiscountCode {
    return new DiscountCode(
      schema.id,
      schema.code,
      schema.discountPercentage,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  static toSchema(discountCode: DiscountCode): DiscountCodeSchema {
    const schema = new DiscountCodeSchema();
    schema.id = discountCode.id;
    schema.code = discountCode.code;
    schema.discountPercentage = discountCode.discountPercentage;
    schema.createdAt = discountCode.createdAt;
    schema.updatedAt = discountCode.updatedAt;
    return schema;
  }
}
