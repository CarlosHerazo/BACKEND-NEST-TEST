import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'products' })
export class ProductSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'img_url' })
  imgUrl: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ length: 100, nullable: true })
  category: string | null;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0,
  })
  rating: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
