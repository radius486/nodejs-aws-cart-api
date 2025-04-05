import { CartEntity } from '../../cart/entities/cart.entity';
import { OrderEntity } from '../../order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => CartEntity, (cart) => cart.user_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  carts?: CartEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user_id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orders?: OrderEntity[];
}
