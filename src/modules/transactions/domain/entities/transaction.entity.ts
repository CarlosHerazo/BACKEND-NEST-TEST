import { TransactionStatus } from '../enums/transaction-status.enum';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly customerEmail: string,
    public readonly amountInCents: number,
    public readonly currency: string,
    public readonly status: TransactionStatus,
    public readonly reference: string,
    public readonly acceptanceToken: string,
    public readonly acceptPersonalAuth: string,
    public readonly paymentMethod?: Record<string, any>,
    public readonly wompiTransactionId?: string,
    public readonly redirectUrl?: string,
    public readonly paymentLinkId?: string,
    public readonly customerFullName?: string,
    public readonly customerPhoneNumber?: string,
    public readonly shippingAddress?: Record<string, any>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    id: string,
    customerId: string,
    customerEmail: string,
    amountInCents: number,
    currency: string,
    reference: string,
    acceptanceToken: string,
    acceptPersonalAuth: string,
    paymentMethod?: Record<string, any>,
    customerFullName?: string,
    customerPhoneNumber?: string,
    shippingAddress?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Transaction {
    return new Transaction(
      id,
      customerId,
      customerEmail,
      amountInCents,
      currency,
      TransactionStatus.PENDING,
      reference,
      acceptanceToken,
      acceptPersonalAuth,
      paymentMethod,
      undefined,
      undefined,
      undefined,
      customerFullName,
      customerPhoneNumber,
      shippingAddress,
      metadata,
      new Date(),
      new Date(),
    );
  }

  updateStatus(
    newStatus: TransactionStatus,
    wompiTransactionId?: string,
    redirectUrl?: string,
    paymentLinkId?: string,
    metadata?: Record<string, any>,
  ): Transaction {
    return new Transaction(
      this.id,
      this.customerId,
      this.customerEmail,
      this.amountInCents,
      this.currency,
      newStatus,
      this.reference,
      this.acceptanceToken,
      this.acceptPersonalAuth,
      this.paymentMethod,
      wompiTransactionId || this.wompiTransactionId,
      redirectUrl || this.redirectUrl,
      paymentLinkId || this.paymentLinkId,
      this.customerFullName,
      this.customerPhoneNumber,
      this.shippingAddress,
      metadata || this.metadata,
      this.createdAt,
      new Date(),
    );
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }

  isDeclined(): boolean {
    return this.status === TransactionStatus.DECLINED;
  }

  isFinal(): boolean {
    return (
      this.status === TransactionStatus.APPROVED ||
      this.status === TransactionStatus.DECLINED ||
      this.status === TransactionStatus.VOIDED
    );
  }
}
