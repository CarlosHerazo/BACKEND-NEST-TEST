import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'discount_codes' })
export class DiscountCodeSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 50 })
  code: string;

  @Column({
    type: 'int',
    name: 'discount_percentage',
  })
  discountPercentage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
