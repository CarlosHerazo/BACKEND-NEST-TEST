import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionSchema } from './transaction.schema';

export class TransactionMapper {
  static toSchema(transaction: Transaction): TransactionSchema {
    const schema = new TransactionSchema();
    schema.id = transaction.id;
    schema.customerId = transaction.customerId;
    schema.customerEmail = transaction.customerEmail;
    schema.amountInCents = transaction.amountInCents;
    schema.currency = transaction.currency;
    schema.status = transaction.status;
    schema.reference = transaction.reference;
    schema.acceptanceToken = transaction.acceptanceToken;
    schema.acceptPersonalAuth = transaction.acceptPersonalAuth;
    schema.paymentMethod = transaction.paymentMethod;
    schema.wompiTransactionId = transaction.wompiTransactionId;
    schema.redirectUrl = transaction.redirectUrl;
    schema.paymentLinkId = transaction.paymentLinkId;
    schema.customerFullName = transaction.customerFullName;
    schema.customerPhoneNumber = transaction.customerPhoneNumber;
    schema.shippingAddress = transaction.shippingAddress;
    schema.metadata = transaction.metadata;
    schema.errorMessage = transaction.errorMessage;
    schema.createdAt = transaction.createdAt;
    schema.updatedAt = transaction.updatedAt;
    return schema;
  }

  static toDomain(schema: TransactionSchema): Transaction {
    return new Transaction(
      schema.id,
      schema.customerId,
      schema.customerEmail,
      schema.amountInCents,
      schema.currency,
      schema.status,
      schema.reference,
      schema.acceptanceToken,
      schema.acceptPersonalAuth,
      schema.paymentMethod,
      schema.wompiTransactionId,
      schema.redirectUrl,
      schema.paymentLinkId,
      schema.customerFullName,
      schema.customerPhoneNumber,
      schema.shippingAddress,
      schema.metadata,
      schema.errorMessage,
      schema.createdAt,
      schema.updatedAt,
    );
  }
}
