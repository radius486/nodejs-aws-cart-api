import { DataSource } from 'typeorm';
import { databaseConfig } from './database';
import { CartEntity } from '../cart/entities/cart.entity';
import { CartItemEntity } from '../cart/entities/cart-item.entity';

export const AppDataSource = new DataSource({
  ...databaseConfig,
  entities: [CartEntity, CartItemEntity],
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
