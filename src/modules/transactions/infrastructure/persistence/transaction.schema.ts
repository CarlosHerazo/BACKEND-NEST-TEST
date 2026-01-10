import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

@Entity('transactions')
export class TransactionSchema {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  customerId: string;

  @Column('varchar', { length: 255 })
  customerEmail: string;

  @Column('bigint')
  amountInCents: number;

  @Column('varchar', { length: 3, default: 'COP' })
  currency: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column('varchar', { length: 100 })
  reference: string;

  @Column('text')
  acceptanceToken: string;

  @Column('text')
  acceptPersonalAuth: string;

  @Column('simple-json', { nullable: true })
  paymentMethod?: Record<string, any>;

  @Column('varchar', { length: 100, nullable: true })
  wompiTransactionId?: string;

  @Column('text', { nullable: true })
  redirectUrl?: string;

  @Column('varchar', { length: 100, nullable: true })
  paymentLinkId?: string;

  @Column('varchar', { length: 255, nullable: true })
  customerFullName?: string;

  @Column('varchar', { length: 50, nullable: true })
  customerPhoneNumber?: string;

  @Column('simple-json', { nullable: true })
  shippingAddress?: Record<string, any>;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
