import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (cartEntity) => cartEntity.id)
  @JoinColumn({ name: 'cart_id' })
  cart_id: string;

  @Column('uuid')
  product_id: string;

  @Column()
  count: number;
}
