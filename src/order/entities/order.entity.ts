import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartEntity } from '../../cart/entities/cart.entity';
import { OrderStatus } from '../type';
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

  @Column('jsonb')
  items: Array<{ productId: string; count: number }>;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Open })
  status: OrderStatus;

  @Column('numeric')
  total: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updated_at: Date;

  @ManyToOne(() => CartEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cart_id' })
  cart?: CartEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
