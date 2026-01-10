import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Customer Database Schema
 * TypeORM entity for customers table
 */
@Entity('customers')
export class CustomerSchema {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('varchar', { length: 100 })
  fullName: string;

  @Column('varchar', { length: 20 })
  phone: string;

  @Column('varchar', { length: 200 })
  address: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('varchar', { length: 10 })
  postalCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
