import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from './cart.entity';
import { CartStatuses } from '../models';

@Entity('orders')
export class OrderEntity {
  // id - uuid
  // user_id - uuid
  // cart_id - uuid (Foreign key from carts.id)
  // payment - JSON
  // delivery - JSON
  // comments - text
  // status - ENUM or text
  // total - number
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => CartEntity, (cartEntity) => cartEntity.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart_id: string;

  @Column('json')
  payment: string;

  @Column('json')
  delivery: string;

  @Column('text')
  comments: string;

  @Column({ type: 'enum', enum: CartStatuses, default: CartStatuses.OPEN })
  status: CartStatuses;

  @Column('numeric')
  total: number;
}
