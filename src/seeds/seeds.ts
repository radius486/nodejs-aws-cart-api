import { DataSource } from 'typeorm';
import { CartEntity } from '../cart/entities/cart.entity';
import { CartItemEntity } from '../cart/entities/cart-item.entity';
import { CartStatuses } from '../cart';
import { UserEntity } from '../users/entities/user.entity';

export const userSeeds: UserEntity[] = [
  {
    id: '2cf9ee55-56b2-4b15-965f-c08e8d50675d',
    email: 'john.doe@example.com',
    password: 'XXXXXXXXXXX',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'dc4d374e-1f3a-4898-aab4-4d1697bef4e8',
    email: 'jane.smith@example.com',
    password: 'XXXXXXXXXXX',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const cartSeeds: CartEntity[] = [
  {
    id: '69d2ccfe-9e27-403c-a513-c8a995a2c4f9',
    user_id: '2cf9ee55-56b2-4b15-965f-c08e8d50675d',
    created_at: new Date(),
    updated_at: new Date(),
    status: CartStatuses.OPEN,
  },
  {
    id: 'd735c339-0930-42b6-8dbc-72db88ebed41',
    user_id: 'dc4d374e-1f3a-4898-aab4-4d1697bef4e8',
    created_at: new Date(),
    updated_at: new Date(),
    status: CartStatuses.ORDERED,
  },
];

export const cartItemSeeds: CartItemEntity[] = [
  {
    cart_id: '69d2ccfe-9e27-403c-a513-c8a995a2c4f9',
    product_id: '6b11038b-797f-43c1-afe2-7d580d79aa77',
    count: 1,
  },
  {
    cart_id: '69d2ccfe-9e27-403c-a513-c8a995a2c4f9',
    product_id: 'c8aa1061-0abe-44d5-835c-e022182e31d0',
    count: 2,
  },
  {
    cart_id: 'd735c339-0930-42b6-8dbc-72db88ebed41',
    product_id: '87e05896-ee02-4232-95ac-fad0da1ef79a',
    count: 3,
  },
];

export async function seedDatabase(dataSource: DataSource) {
  try {
    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.save(userSeeds);

    const cartRepository = dataSource.getRepository(CartEntity);
    await cartRepository.save(cartSeeds);

    const cartItemRepository = dataSource.getRepository(CartItemEntity);
    await cartItemRepository.save(cartItemSeeds);

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
