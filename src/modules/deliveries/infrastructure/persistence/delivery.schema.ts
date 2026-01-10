import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';

@Entity('deliveries')
export class DeliverySchema {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Index()
  @Column('varchar', { length: 36 })
  transactionId: string;

  @Column('varchar', { length: 255 })
  customerName: string;

  @Column('varchar', { length: 50 })
  customerPhone: string;

  @Column('varchar', { length: 500 })
  addressLine1: string;

  @Column('varchar', { length: 500, nullable: true })
  addressLine2?: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  region: string;

  @Column('varchar', { length: 2 })
  country: string;

  @Column('varchar', { length: 20, nullable: true })
  postalCode?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column('varchar', { length: 100, nullable: true })
  trackingNumber?: string;

  @Column('timestamp', { nullable: true })
  estimatedDeliveryDate?: Date;

  @Column('timestamp', { nullable: true })
  actualDeliveryDate?: Date;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
