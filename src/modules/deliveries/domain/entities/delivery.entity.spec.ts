import { Delivery } from './delivery.entity';
import { DeliveryStatus } from '../enums/delivery-status.enum';

describe('Delivery Entity', () => {
  const mockDate = new Date('2024-01-09T10:00:00Z');

  const validDeliveryProps = {
    transactionId: 'transaction-123',
    customerName: 'John Doe',
    customerPhone: '+573001234567',
    address: {
      addressLine1: 'Calle 123 #45-67',
      addressLine2: 'Apt 101',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'CO',
      postalCode: '110111',
    },
    status: DeliveryStatus.PENDING,
    trackingNumber: 'TRACK-123',
    estimatedDeliveryDate: mockDate,
    notes: 'Test delivery',
  };

  describe('create', () => {
    it('should create a new delivery with generated id and timestamps', () => {
      const delivery = Delivery.create(validDeliveryProps);

      expect(delivery.id).toBeDefined();
      expect(delivery.id).toHaveLength(36); // UUID length
      expect(delivery.transactionId).toBe(validDeliveryProps.transactionId);
      expect(delivery.customerName).toBe(validDeliveryProps.customerName);
      expect(delivery.customerPhone).toBe(validDeliveryProps.customerPhone);
      expect(delivery.address).toEqual(validDeliveryProps.address);
      expect(delivery.status).toBe(DeliveryStatus.PENDING);
      expect(delivery.createdAt).toBeInstanceOf(Date);
      expect(delivery.updatedAt).toBeInstanceOf(Date);
    });

    it('should create delivery without optional fields', () => {
      const minimalProps = {
        transactionId: 'transaction-123',
        customerName: 'John Doe',
        customerPhone: '+573001234567',
        address: {
          addressLine1: 'Calle 123',
          city: 'Bogotá',
          region: 'Cundinamarca',
          country: 'CO',
        },
        status: DeliveryStatus.PENDING,
      };

      const delivery = Delivery.create(minimalProps);

      expect(delivery.id).toBeDefined();
      expect(delivery.trackingNumber).toBeUndefined();
      expect(delivery.estimatedDeliveryDate).toBeUndefined();
      expect(delivery.notes).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('should create delivery from persisted data', () => {
      const persistedProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const delivery = Delivery.fromPersistence(persistedProps);

      expect(delivery.id).toBe(persistedProps.id);
      expect(delivery.transactionId).toBe(persistedProps.transactionId);
      expect(delivery.createdAt).toEqual(mockDate);
      expect(delivery.updatedAt).toEqual(mockDate);
    });
  });

  describe('getters', () => {
    let delivery: Delivery;

    beforeEach(() => {
      delivery = Delivery.fromPersistence({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        actualDeliveryDate: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should return id', () => {
      expect(delivery.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return transactionId', () => {
      expect(delivery.transactionId).toBe('transaction-123');
    });

    it('should return customerName', () => {
      expect(delivery.customerName).toBe('John Doe');
    });

    it('should return customerPhone', () => {
      expect(delivery.customerPhone).toBe('+573001234567');
    });

    it('should return address', () => {
      expect(delivery.address).toEqual(validDeliveryProps.address);
    });

    it('should return status', () => {
      expect(delivery.status).toBe(DeliveryStatus.PENDING);
    });

    it('should return trackingNumber', () => {
      expect(delivery.trackingNumber).toBe('TRACK-123');
    });

    it('should return estimatedDeliveryDate', () => {
      expect(delivery.estimatedDeliveryDate).toEqual(mockDate);
    });

    it('should return actualDeliveryDate as undefined initially', () => {
      expect(delivery.actualDeliveryDate).toBeUndefined();
    });

    it('should return notes', () => {
      expect(delivery.notes).toBe('Test delivery');
    });

    it('should return createdAt', () => {
      expect(delivery.createdAt).toEqual(mockDate);
    });

    it('should return updatedAt', () => {
      expect(delivery.updatedAt).toEqual(mockDate);
    });
  });

  describe('updateStatus', () => {
    let delivery: Delivery;

    beforeEach(() => {
      delivery = Delivery.fromPersistence({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should update status to IN_TRANSIT', () => {
      const updated = delivery.updateStatus(DeliveryStatus.IN_TRANSIT);

      expect(updated.status).toBe(DeliveryStatus.IN_TRANSIT);
      expect(updated.id).toBe(delivery.id);
      expect(updated.updatedAt).not.toEqual(delivery.updatedAt);
    });

    it('should update status to DELIVERED and set actualDeliveryDate', () => {
      const updated = delivery.updateStatus(DeliveryStatus.DELIVERED);

      expect(updated.status).toBe(DeliveryStatus.DELIVERED);
      expect(updated.actualDeliveryDate).toBeInstanceOf(Date);
    });

    it('should update status with notes', () => {
      const updated = delivery.updateStatus(DeliveryStatus.IN_TRANSIT, 'Package shipped');

      expect(updated.status).toBe(DeliveryStatus.IN_TRANSIT);
      expect(updated.notes).toBe('Package shipped');
    });

    it('should preserve existing notes when no new notes provided', () => {
      const updated = delivery.updateStatus(DeliveryStatus.IN_TRANSIT);

      expect(updated.notes).toBe('Test delivery');
    });

    it('should not set actualDeliveryDate for non-delivered status', () => {
      const updated = delivery.updateStatus(DeliveryStatus.IN_TRANSIT);

      expect(updated.actualDeliveryDate).toBeUndefined();
    });
  });

  describe('setTrackingNumber', () => {
    it('should set tracking number on persisted delivery', () => {
      const delivery = Delivery.fromPersistence({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        trackingNumber: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const updated = delivery.setTrackingNumber('NEW-TRACK-456');

      expect(updated.trackingNumber).toBe('NEW-TRACK-456');
      expect(updated.id).toBe(delivery.id);
      // New updatedAt should be different from the mock date
      expect(updated.updatedAt.getTime()).toBeGreaterThan(mockDate.getTime());
    });

    it('should update existing tracking number', () => {
      const delivery = Delivery.fromPersistence({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const updated = delivery.setTrackingNumber('UPDATED-TRACK-789');

      expect(updated.trackingNumber).toBe('UPDATED-TRACK-789');
    });
  });

  describe('toJSON', () => {
    it('should return all properties as plain object', () => {
      const delivery = Delivery.fromPersistence({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validDeliveryProps,
        actualDeliveryDate: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      const json = delivery.toJSON();

      expect(json).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionId: 'transaction-123',
        customerName: 'John Doe',
        customerPhone: '+573001234567',
        address: validDeliveryProps.address,
        status: DeliveryStatus.PENDING,
        trackingNumber: 'TRACK-123',
        estimatedDeliveryDate: mockDate,
        actualDeliveryDate: undefined,
        notes: 'Test delivery',
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });
  });
});
