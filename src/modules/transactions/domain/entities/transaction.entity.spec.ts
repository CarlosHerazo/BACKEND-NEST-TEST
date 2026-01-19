import { Transaction } from './transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('Transaction Entity', () => {
  const mockDate = new Date('2024-01-09T10:00:00Z');

  const createMockTransaction = (status: TransactionStatus = TransactionStatus.PENDING): Transaction => {
    return new Transaction(
      '123e4567-e89b-12d3-a456-426614174000',
      'customer-123',
      'test@example.com',
      100000,
      'COP',
      status,
      'ORDER-123456',
      'acceptance-token',
      'personal-auth-token',
      { type: 'CARD' },
      'wompi-trans-123',
      'https://redirect.url',
      'link-123',
      'John Doe',
      '+573001234567',
      { city: 'Bogotá', addressLine1: 'Calle 123' },
      { orderId: '123' },
      undefined,
      mockDate,
      mockDate,
    );
  };

  describe('constructor', () => {
    it('should create a transaction with all properties', () => {
      const transaction = createMockTransaction();

      expect(transaction.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(transaction.customerId).toBe('customer-123');
      expect(transaction.customerEmail).toBe('test@example.com');
      expect(transaction.amountInCents).toBe(100000);
      expect(transaction.currency).toBe('COP');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.reference).toBe('ORDER-123456');
      expect(transaction.acceptanceToken).toBe('acceptance-token');
      expect(transaction.acceptPersonalAuth).toBe('personal-auth-token');
      expect(transaction.paymentMethod).toEqual({ type: 'CARD' });
      expect(transaction.wompiTransactionId).toBe('wompi-trans-123');
      expect(transaction.redirectUrl).toBe('https://redirect.url');
      expect(transaction.paymentLinkId).toBe('link-123');
      expect(transaction.customerFullName).toBe('John Doe');
      expect(transaction.customerPhoneNumber).toBe('+573001234567');
      expect(transaction.shippingAddress).toEqual({ city: 'Bogotá', addressLine1: 'Calle 123' });
      expect(transaction.metadata).toEqual({ orderId: '123' });
      expect(transaction.errorMessage).toBeUndefined();
    });

    it('should default createdAt and updatedAt to current date', () => {
      const transaction = new Transaction(
        'id',
        'customer-123',
        'test@example.com',
        100000,
        'COP',
        TransactionStatus.PENDING,
        'ORDER-123456',
        'acceptance-token',
        'personal-auth-token',
      );

      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('should create a new transaction with PENDING status', () => {
      const transaction = Transaction.create(
        'id-123',
        'customer-123',
        'test@example.com',
        100000,
        'COP',
        'ORDER-123456',
        'acceptance-token',
        'personal-auth-token',
        { type: 'CARD' },
        'John Doe',
        '+573001234567',
        { city: 'Bogotá' },
        { orderId: '123' },
      );

      expect(transaction.id).toBe('id-123');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.wompiTransactionId).toBeUndefined();
      expect(transaction.redirectUrl).toBeUndefined();
      expect(transaction.paymentLinkId).toBeUndefined();
      expect(transaction.errorMessage).toBeUndefined();
      expect(transaction.createdAt).toBeInstanceOf(Date);
      expect(transaction.updatedAt).toBeInstanceOf(Date);
    });

    it('should create transaction without optional fields', () => {
      const transaction = Transaction.create(
        'id-123',
        'customer-123',
        'test@example.com',
        100000,
        'COP',
        'ORDER-123456',
        'acceptance-token',
        'personal-auth-token',
      );

      expect(transaction.paymentMethod).toBeUndefined();
      expect(transaction.customerFullName).toBeUndefined();
      expect(transaction.customerPhoneNumber).toBeUndefined();
      expect(transaction.shippingAddress).toBeUndefined();
      expect(transaction.metadata).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update status to APPROVED', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(TransactionStatus.APPROVED);

      expect(updated.status).toBe(TransactionStatus.APPROVED);
      expect(updated.id).toBe(transaction.id);
    });

    it('should update status with wompiTransactionId', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(
        TransactionStatus.APPROVED,
        'new-wompi-id',
      );

      expect(updated.status).toBe(TransactionStatus.APPROVED);
      expect(updated.wompiTransactionId).toBe('new-wompi-id');
    });

    it('should update status with redirectUrl', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(
        TransactionStatus.PENDING,
        undefined,
        'https://new-redirect.url',
      );

      expect(updated.redirectUrl).toBe('https://new-redirect.url');
    });

    it('should update status with paymentLinkId', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(
        TransactionStatus.PENDING,
        undefined,
        undefined,
        'new-link-id',
      );

      expect(updated.paymentLinkId).toBe('new-link-id');
    });

    it('should update status with metadata', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(
        TransactionStatus.PENDING,
        undefined,
        undefined,
        undefined,
        { newKey: 'newValue' },
      );

      expect(updated.metadata).toEqual({ newKey: 'newValue' });
    });

    it('should update status with errorMessage', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(
        TransactionStatus.ERROR,
        undefined,
        undefined,
        undefined,
        undefined,
        'Payment failed',
      );

      expect(updated.status).toBe(TransactionStatus.ERROR);
      expect(updated.errorMessage).toBe('Payment failed');
    });

    it('should preserve existing values when not provided', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(TransactionStatus.APPROVED);

      expect(updated.wompiTransactionId).toBe(transaction.wompiTransactionId);
      expect(updated.redirectUrl).toBe(transaction.redirectUrl);
      expect(updated.paymentLinkId).toBe(transaction.paymentLinkId);
      expect(updated.metadata).toBe(transaction.metadata);
    });

    it('should update updatedAt timestamp', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(TransactionStatus.APPROVED);

      expect(updated.updatedAt).not.toEqual(transaction.updatedAt);
    });

    it('should preserve createdAt timestamp', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      const updated = transaction.updateStatus(TransactionStatus.APPROVED);

      expect(updated.createdAt).toEqual(transaction.createdAt);
    });
  });

  describe('isPending', () => {
    it('should return true for PENDING status', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      expect(transaction.isPending()).toBe(true);
    });

    it('should return false for non-PENDING status', () => {
      const transaction = createMockTransaction(TransactionStatus.APPROVED);

      expect(transaction.isPending()).toBe(false);
    });
  });

  describe('isApproved', () => {
    it('should return true for APPROVED status', () => {
      const transaction = createMockTransaction(TransactionStatus.APPROVED);

      expect(transaction.isApproved()).toBe(true);
    });

    it('should return false for non-APPROVED status', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      expect(transaction.isApproved()).toBe(false);
    });
  });

  describe('isDeclined', () => {
    it('should return true for DECLINED status', () => {
      const transaction = createMockTransaction(TransactionStatus.DECLINED);

      expect(transaction.isDeclined()).toBe(true);
    });

    it('should return false for non-DECLINED status', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      expect(transaction.isDeclined()).toBe(false);
    });
  });

  describe('isFinal', () => {
    it('should return true for APPROVED status', () => {
      const transaction = createMockTransaction(TransactionStatus.APPROVED);

      expect(transaction.isFinal()).toBe(true);
    });

    it('should return true for DECLINED status', () => {
      const transaction = createMockTransaction(TransactionStatus.DECLINED);

      expect(transaction.isFinal()).toBe(true);
    });

    it('should return true for VOIDED status', () => {
      const transaction = createMockTransaction(TransactionStatus.VOIDED);

      expect(transaction.isFinal()).toBe(true);
    });

    it('should return false for PENDING status', () => {
      const transaction = createMockTransaction(TransactionStatus.PENDING);

      expect(transaction.isFinal()).toBe(false);
    });

    it('should return false for ERROR status', () => {
      const transaction = createMockTransaction(TransactionStatus.ERROR);

      expect(transaction.isFinal()).toBe(false);
    });
  });
});
