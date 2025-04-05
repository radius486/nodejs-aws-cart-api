import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartStatuses } from '../models';
import { CartItemEntity } from './cart-item.entity';
import { OrderEntity } from '../../order/entities/order.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'enum', enum: CartStatuses, default: CartStatuses.OPEN })
  status: CartStatuses;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: true,
    onDelete: 'CASCADE',
    // eager: true,
  })
  items?: CartItemEntity[];

  @OneToMany(() => OrderEntity, (order) => order.cart, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orders?: OrderEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
