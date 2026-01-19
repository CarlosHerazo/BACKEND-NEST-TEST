import { TransactionMapper } from './transaction.mapper';
import { TransactionSchema } from './transaction.schema';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('TransactionMapper', () => {
  const mockDate = new Date('2024-01-09T10:00:00Z');

  const mockTransactionSchema: TransactionSchema = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    customerId: 'customer-123',
    customerEmail: 'test@example.com',
    amountInCents: 100000,
    currency: 'COP',
    status: TransactionStatus.PENDING,
    reference: 'ORDER-123456',
    acceptanceToken: 'acceptance-token',
    acceptPersonalAuth: 'personal-auth-token',
    paymentMethod: { type: 'CARD' },
    wompiTransactionId: 'wompi-123',
    redirectUrl: 'https://redirect.url',
    paymentLinkId: 'link-123',
    customerFullName: 'John Doe',
    customerPhoneNumber: '+573001234567',
    shippingAddress: { city: 'Bogotá', address: 'Calle 123' },
    metadata: { orderId: '123' },
    errorMessage: undefined,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockTransaction = new Transaction(
    mockTransactionSchema.id,
    mockTransactionSchema.customerId,
    mockTransactionSchema.customerEmail,
    mockTransactionSchema.amountInCents,
    mockTransactionSchema.currency,
    mockTransactionSchema.status,
    mockTransactionSchema.reference,
    mockTransactionSchema.acceptanceToken,
    mockTransactionSchema.acceptPersonalAuth,
    mockTransactionSchema.paymentMethod,
    mockTransactionSchema.wompiTransactionId,
    mockTransactionSchema.redirectUrl,
    mockTransactionSchema.paymentLinkId,
    mockTransactionSchema.customerFullName,
    mockTransactionSchema.customerPhoneNumber,
    mockTransactionSchema.shippingAddress,
    mockTransactionSchema.metadata,
    mockTransactionSchema.errorMessage,
    mockDate,
    mockDate,
  );

  describe('toDomain', () => {
    it('should map TransactionSchema to Transaction domain entity', () => {
      const result = TransactionMapper.toDomain(mockTransactionSchema);

      expect(result).toBeInstanceOf(Transaction);
      expect(result.id).toBe(mockTransactionSchema.id);
      expect(result.customerId).toBe(mockTransactionSchema.customerId);
      expect(result.customerEmail).toBe(mockTransactionSchema.customerEmail);
      expect(result.amountInCents).toBe(mockTransactionSchema.amountInCents);
      expect(result.currency).toBe(mockTransactionSchema.currency);
      expect(result.status).toBe(mockTransactionSchema.status);
      expect(result.reference).toBe(mockTransactionSchema.reference);
      expect(result.acceptanceToken).toBe(mockTransactionSchema.acceptanceToken);
      expect(result.acceptPersonalAuth).toBe(mockTransactionSchema.acceptPersonalAuth);
      expect(result.paymentMethod).toEqual(mockTransactionSchema.paymentMethod);
      expect(result.wompiTransactionId).toBe(mockTransactionSchema.wompiTransactionId);
      expect(result.redirectUrl).toBe(mockTransactionSchema.redirectUrl);
      expect(result.paymentLinkId).toBe(mockTransactionSchema.paymentLinkId);
      expect(result.customerFullName).toBe(mockTransactionSchema.customerFullName);
      expect(result.customerPhoneNumber).toBe(mockTransactionSchema.customerPhoneNumber);
      expect(result.shippingAddress).toEqual(mockTransactionSchema.shippingAddress);
      expect(result.metadata).toEqual(mockTransactionSchema.metadata);
      expect(result.errorMessage).toBe(mockTransactionSchema.errorMessage);
    });

    it('should handle optional fields as undefined', () => {
      const schemaWithOptionalNulls: TransactionSchema = {
        ...mockTransactionSchema,
        paymentMethod: undefined,
        wompiTransactionId: undefined,
        redirectUrl: undefined,
        paymentLinkId: undefined,
        customerFullName: undefined,
        customerPhoneNumber: undefined,
        shippingAddress: undefined,
        metadata: undefined,
        errorMessage: undefined,
      };

      const result = TransactionMapper.toDomain(schemaWithOptionalNulls);

      expect(result.paymentMethod).toBeUndefined();
      expect(result.wompiTransactionId).toBeUndefined();
      expect(result.redirectUrl).toBeUndefined();
      expect(result.paymentLinkId).toBeUndefined();
      expect(result.customerFullName).toBeUndefined();
      expect(result.customerPhoneNumber).toBeUndefined();
      expect(result.shippingAddress).toBeUndefined();
      expect(result.metadata).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });
  });

  describe('toSchema', () => {
    it('should map Transaction domain entity to TransactionSchema', () => {
      const result = TransactionMapper.toSchema(mockTransaction);

      expect(result).toBeInstanceOf(TransactionSchema);
      expect(result.id).toBe(mockTransaction.id);
      expect(result.customerId).toBe(mockTransaction.customerId);
      expect(result.customerEmail).toBe(mockTransaction.customerEmail);
      expect(result.amountInCents).toBe(mockTransaction.amountInCents);
      expect(result.currency).toBe(mockTransaction.currency);
      expect(result.status).toBe(mockTransaction.status);
      expect(result.reference).toBe(mockTransaction.reference);
      expect(result.acceptanceToken).toBe(mockTransaction.acceptanceToken);
      expect(result.acceptPersonalAuth).toBe(mockTransaction.acceptPersonalAuth);
      expect(result.paymentMethod).toEqual(mockTransaction.paymentMethod);
      expect(result.wompiTransactionId).toBe(mockTransaction.wompiTransactionId);
      expect(result.redirectUrl).toBe(mockTransaction.redirectUrl);
      expect(result.paymentLinkId).toBe(mockTransaction.paymentLinkId);
      expect(result.customerFullName).toBe(mockTransaction.customerFullName);
      expect(result.customerPhoneNumber).toBe(mockTransaction.customerPhoneNumber);
      expect(result.shippingAddress).toEqual(mockTransaction.shippingAddress);
      expect(result.metadata).toEqual(mockTransaction.metadata);
      expect(result.errorMessage).toBe(mockTransaction.errorMessage);
    });
  });

  describe('bidirectional mapping', () => {
    it('should preserve data when mapping schema -> domain -> schema', () => {
      const domain = TransactionMapper.toDomain(mockTransactionSchema);
      const schema = TransactionMapper.toSchema(domain);

      expect(schema.id).toBe(mockTransactionSchema.id);
      expect(schema.customerId).toBe(mockTransactionSchema.customerId);
      expect(schema.customerEmail).toBe(mockTransactionSchema.customerEmail);
      expect(schema.amountInCents).toBe(mockTransactionSchema.amountInCents);
      expect(schema.currency).toBe(mockTransactionSchema.currency);
      expect(schema.status).toBe(mockTransactionSchema.status);
      expect(schema.reference).toBe(mockTransactionSchema.reference);
    });
  });
});
