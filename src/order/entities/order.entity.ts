import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartEntity } from '../../cart/entities/cart.entity';
import { CartStatuses } from '../../cart/models';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'cart_id', type: 'uuid' })
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

  @ManyToOne(() => CartEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cart_id' })
  cart?: CartEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
