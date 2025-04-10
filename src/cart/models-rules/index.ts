import { CartItemEntity } from '../entities/cart-item.entity';

export async function calculateCartTotal(
  items: CartItemEntity[],
): Promise<number> {
  try {
    if (!items.length) return 0;

    return items.reduce((total: number, item: CartItemEntity) => {
      return total + 100 * item.count;
    }, 0);
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
}
