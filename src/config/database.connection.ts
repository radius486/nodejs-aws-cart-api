import { DataSource } from 'typeorm';
import { databaseConfig } from './database';
import { CartEntity } from '../cart/entities/cart.entity';
import { CartItemEntity } from '../cart/entities/cart-item.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';

export const AppDataSource = new DataSource({
  ...databaseConfig,
  entities: [CartEntity, CartItemEntity, OrderEntity, UserEntity],
});

export async function createConnection(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Data Source has been initialized!');
    }
    return AppDataSource;
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
    throw error;
  }
}
