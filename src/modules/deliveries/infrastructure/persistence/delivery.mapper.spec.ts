import { DeliveryMapper } from './delivery.mapper';
import { DeliverySchema } from './delivery.schema';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

describe('DeliveryMapper', () => {
  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockDeliverySchema: DeliverySchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    transactionId: 'transaction-123',
    customerName: 'John Doe',
    customerPhone: '+573001234567',
    addressLine1: 'Calle 123 #45-67',
    addressLine2: 'Apt 101',
    city: 'Bogotá',
    region: 'Cundinamarca',
    country: 'CO',
    postalCode: '110111',
    status: DeliveryStatus.PENDING,
    trackingNumber: 'TRACK-123',
    estimatedDeliveryDate: mockDate,
    actualDeliveryDate: undefined,
    notes: 'Test delivery',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockDelivery = Delivery.fromPersistence({
    id: mockDeliverySchema.id,
    transactionId: mockDeliverySchema.transactionId,
    customerName: mockDeliverySchema.customerName,
    customerPhone: mockDeliverySchema.customerPhone,
    address: {
      addressLine1: mockDeliverySchema.addressLine1,
      addressLine2: mockDeliverySchema.addressLine2,
      city: mockDeliverySchema.city,
      region: mockDeliverySchema.region,
      country: mockDeliverySchema.country,
      postalCode: mockDeliverySchema.postalCode,
    },
    status: mockDeliverySchema.status,
    trackingNumber: mockDeliverySchema.trackingNumber,
    estimatedDeliveryDate: mockDeliverySchema.estimatedDeliveryDate,
    actualDeliveryDate: mockDeliverySchema.actualDeliveryDate,
    notes: mockDeliverySchema.notes,
    createdAt: mockDate,
    updatedAt: mockDate,
  });

  describe('toDomain', () => {
    it('should map DeliverySchema to Delivery domain entity', () => {
      const result = DeliveryMapper.toDomain(mockDeliverySchema);

      expect(result.id).toBe(mockDeliverySchema.id);
      expect(result.transactionId).toBe(mockDeliverySchema.transactionId);
      expect(result.customerName).toBe(mockDeliverySchema.customerName);
      expect(result.customerPhone).toBe(mockDeliverySchema.customerPhone);
      expect(result.address.addressLine1).toBe(mockDeliverySchema.addressLine1);
      expect(result.address.addressLine2).toBe(mockDeliverySchema.addressLine2);
      expect(result.address.city).toBe(mockDeliverySchema.city);
      expect(result.address.region).toBe(mockDeliverySchema.region);
      expect(result.address.country).toBe(mockDeliverySchema.country);
      expect(result.address.postalCode).toBe(mockDeliverySchema.postalCode);
      expect(result.status).toBe(mockDeliverySchema.status);
      expect(result.trackingNumber).toBe(mockDeliverySchema.trackingNumber);
      expect(result.estimatedDeliveryDate).toEqual(mockDeliverySchema.estimatedDeliveryDate);
      expect(result.notes).toBe(mockDeliverySchema.notes);
    });

    it('should handle optional fields as undefined', () => {
      const schemaWithOptionalNulls: DeliverySchema = {
        ...mockDeliverySchema,
        addressLine2: undefined,
        postalCode: undefined,
        trackingNumber: undefined,
        estimatedDeliveryDate: undefined,
        actualDeliveryDate: undefined,
        notes: undefined,
      };

      const result = DeliveryMapper.toDomain(schemaWithOptionalNulls);

      expect(result.address.addressLine2).toBeUndefined();
      expect(result.address.postalCode).toBeUndefined();
      expect(result.trackingNumber).toBeUndefined();
      expect(result.estimatedDeliveryDate).toBeUndefined();
      expect(result.actualDeliveryDate).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });
  });

  describe('toSchema', () => {
    it('should map Delivery domain entity to DeliverySchema', () => {
      const result = DeliveryMapper.toSchema(mockDelivery);

      expect(result).toBeInstanceOf(DeliverySchema);
      expect(result.id).toBe(mockDelivery.id);
      expect(result.transactionId).toBe(mockDelivery.transactionId);
      expect(result.customerName).toBe(mockDelivery.customerName);
      expect(result.customerPhone).toBe(mockDelivery.customerPhone);
      expect(result.addressLine1).toBe(mockDelivery.address.addressLine1);
      expect(result.addressLine2).toBe(mockDelivery.address.addressLine2);
      expect(result.city).toBe(mockDelivery.address.city);
      expect(result.region).toBe(mockDelivery.address.region);
      expect(result.country).toBe(mockDelivery.address.country);
      expect(result.postalCode).toBe(mockDelivery.address.postalCode);
      expect(result.status).toBe(mockDelivery.status);
      expect(result.trackingNumber).toBe(mockDelivery.trackingNumber);
      expect(result.estimatedDeliveryDate).toEqual(mockDelivery.estimatedDeliveryDate);
      expect(result.notes).toBe(mockDelivery.notes);
    });
  });

  describe('bidirectional mapping', () => {
    it('should preserve data when mapping schema -> domain -> schema', () => {
      const domain = DeliveryMapper.toDomain(mockDeliverySchema);
      const schema = DeliveryMapper.toSchema(domain);

      expect(schema.id).toBe(mockDeliverySchema.id);
      expect(schema.transactionId).toBe(mockDeliverySchema.transactionId);
      expect(schema.customerName).toBe(mockDeliverySchema.customerName);
      expect(schema.customerPhone).toBe(mockDeliverySchema.customerPhone);
      expect(schema.addressLine1).toBe(mockDeliverySchema.addressLine1);
      expect(schema.addressLine2).toBe(mockDeliverySchema.addressLine2);
      expect(schema.city).toBe(mockDeliverySchema.city);
      expect(schema.region).toBe(mockDeliverySchema.region);
      expect(schema.country).toBe(mockDeliverySchema.country);
      expect(schema.status).toBe(mockDeliverySchema.status);
    });
  });
});
