import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliverySchema } from './delivery.schema';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

export class DeliveryMapper {
  static toDomain(schema: DeliverySchema): Delivery {
    return Delivery.fromPersistence({
      id: schema.id,
      transactionId: schema.transactionId,
      customerName: schema.customerName,
      customerPhone: schema.customerPhone,
      address: {
        addressLine1: schema.addressLine1,
        addressLine2: schema.addressLine2,
        city: schema.city,
        region: schema.region,
        country: schema.country,
        postalCode: schema.postalCode,
      },
      status: schema.status as DeliveryStatus,
      trackingNumber: schema.trackingNumber,
      estimatedDeliveryDate: schema.estimatedDeliveryDate,
      actualDeliveryDate: schema.actualDeliveryDate,
      notes: schema.notes,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toSchema(delivery: Delivery): DeliverySchema {
    const schema = new DeliverySchema();
    schema.id = delivery.id;
    schema.transactionId = delivery.transactionId;
    schema.customerName = delivery.customerName;
    schema.customerPhone = delivery.customerPhone;
    schema.addressLine1 = delivery.address.addressLine1;
    schema.addressLine2 = delivery.address.addressLine2;
    schema.city = delivery.address.city;
    schema.region = delivery.address.region;
    schema.country = delivery.address.country;
    schema.postalCode = delivery.address.postalCode;
    schema.status = delivery.status;
    schema.trackingNumber = delivery.trackingNumber;
    schema.estimatedDeliveryDate = delivery.estimatedDeliveryDate;
    schema.actualDeliveryDate = delivery.actualDeliveryDate;
    schema.notes = delivery.notes;
    schema.createdAt = delivery.createdAt;
    schema.updatedAt = delivery.updatedAt;
    return schema;
  }
}
