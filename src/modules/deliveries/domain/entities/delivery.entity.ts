import { DeliveryStatus } from '../enums/delivery-status.enum';

export interface DeliveryProps {
  id: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
  };
  status: DeliveryStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Delivery {
  private constructor(private readonly props: DeliveryProps) {}

  static create(props: Omit<DeliveryProps, 'id' | 'createdAt' | 'updatedAt'>): Delivery {
    return new Delivery({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  get id(): string {
    return this.props.id;
  }

  get transactionId(): string {
    return this.props.transactionId;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get customerPhone(): string {
    return this.props.customerPhone;
  }

  get address(): DeliveryProps['address'] {
    return this.props.address;
  }

  get status(): DeliveryStatus {
    return this.props.status;
  }

  get trackingNumber(): string | undefined {
    return this.props.trackingNumber;
  }

  get estimatedDeliveryDate(): Date | undefined {
    return this.props.estimatedDeliveryDate;
  }

  get actualDeliveryDate(): Date | undefined {
    return this.props.actualDeliveryDate;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateStatus(newStatus: DeliveryStatus, notes?: string): Delivery {
    return new Delivery({
      ...this.props,
      status: newStatus,
      notes: notes || this.props.notes,
      actualDeliveryDate:
        newStatus === DeliveryStatus.DELIVERED ? new Date() : this.props.actualDeliveryDate,
      updatedAt: new Date(),
    });
  }

  setTrackingNumber(trackingNumber: string): Delivery {
    return new Delivery({
      ...this.props,
      trackingNumber,
      updatedAt: new Date(),
    });
  }

  toJSON(): DeliveryProps {
    return { ...this.props };
  }
}
