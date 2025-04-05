import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { OrderStatus, PutCartPayload } from '../order/type';
import { CartItemEntity } from './entities/cart-item.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { CartEntity } from './entities/cart.entity';
import { CartStatuses } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItemEntity[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItemEntity[]> {
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest) {
    const userId = getUserIdFromRequest(req);

    // Use TypeORM's transaction to ensure all operations succeed or none do
    return await this.cartService.dataSource.transaction(
      async (transactionalEntityManager) => {
        // Get cart with transaction
        const cart = await transactionalEntityManager
          .getRepository(CartEntity)
          .findOne({
            where: { user_id: userId, status: CartStatuses.OPEN },
            relations: ['items'],
          });

        if (!(cart && cart.items.length)) {
          throw new BadRequestException('Cart is empty');
        }

        const { id: cartId, items } = cart;
        const total = await calculateCartTotal(items);

        // Create order within transaction
        const order = await transactionalEntityManager
          .getRepository(OrderEntity)
          .save({
            id: randomUUID(),
            user_id: userId,
            cart_id: cartId,
            total,
            status: OrderStatus.Open,
            comments: 'No comments',
            delivery: '',
            payment: '',
            items,
            created_at: new Date(),
            updated_at: new Date(),
          });

        // Update cart status within same transaction
        await transactionalEntityManager.getRepository(CartEntity).update(
          { id: cartId },
          { status: CartStatuses.ORDERED }, // update data
        );

        return { order };
      },
    );
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  getOrder(): Promise<OrderEntity[]> {
    return this.orderService.getAll();
  }
}
