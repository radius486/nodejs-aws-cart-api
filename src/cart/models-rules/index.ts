import { CartItemEntity } from '../entities/cart-item.entity';

export function calculateCartTotal(items: CartItemEntity[]): number {
  return items.length
    ? items.reduce((acc: number, { product_id, count }: CartItemEntity) => {
        // TODO: Change hardcoded value
        const price = 100;
        return (acc += price * count);
      }, 0)
    : 0;
}
