import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
  ) {}

  private userCarts: Record<string, CartEntity> = {};

  async findByUserId(userId: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId, status: CartStatuses.OPEN },
      relations: {
        items: true,
      },
    });

    return cart;
  }

  async createByUserId(user_id: string): Promise<CartEntity> {
    const userCart: CartEntity = {
      id: randomUUID(),
      user_id,
      created_at: new Date(),
      updated_at: new Date(),
      status: CartStatuses.OPEN,
    };

    await this.cartRepository.save(userCart);

    const cart = this.cartRepository.findOne({
      where: { id: userCart.id },
      relations: {
        items: true,
      },
    });

    return cart;
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    payload: PutCartPayload,
  ): Promise<CartEntity> {
    const userCart = await this.findOrCreateByUserId(userId);

    const index = userCart.items.findIndex(
      ({ product_id }) => product_id === payload.product.id,
    );

    if (index === -1) {
      const newItem: CartItemEntity = {
        cart_id: userCart.id,
        product_id: payload.product.id,
        count: payload.count,
      };

      if (!newItem.count) {
        return userCart;
      }

      await this.cartItemRepository.save(newItem);
    } else if (payload.count === 0) {
      await this.cartItemRepository.delete({
        cart_id: userCart.items[index].cart_id,
        product_id: userCart.items[index].product_id,
      });
    } else {
      const updatedItem: CartItemEntity = {
        ...userCart.items[index],
        count: userCart.items[index].count + payload.count,
      };

      await this.cartItemRepository.update(
        {
          cart_id: userCart.items[index].cart_id,
          product_id: userCart.items[index].product_id,
        },
        updatedItem,
      );
    }

    return await this.findOrCreateByUserId(userId);
  }

  async removeByUserId(userId): Promise<void> {
    await this.cartRepository.delete({ user_id: userId });
  }

  async setCartAsOrdered(cart_id: string): Promise<void> {
    await this.cartRepository.update(
      { id: cart_id },
      { status: CartStatuses.ORDERED },
    );
  }
}
