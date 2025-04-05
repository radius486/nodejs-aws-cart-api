import { CartItemEntity } from '../entities/cart-item.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const PRODUCT_ENDPOINT = process.env.PRODUCT_ENDPOINT;

export async function calculateCartTotal(
  items: CartItemEntity[],
): Promise<number> {
  try {
    if (!items.length) return 0;

    const prices = await Promise.all(
      items.map(async ({ product_id }: CartItemEntity) => {
        const url = `${PRODUCT_ENDPOINT}${product_id}`;
        return await fetchData(url);
      }),
    );

    return items.reduce(
      (total: number, item: CartItemEntity, index: number) => {
        return total + prices[index].price * item.count;
      },
      0,
    );
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
}

export async function fetchData(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
