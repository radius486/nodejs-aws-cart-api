import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderPayload, OrderStatus } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  private orders: Record<string, OrderEntity> = {};

  async getAll(userId: string) {
    return await this.orderRepository.find({
      where: { user_id: userId },
    });
  }

  async findById(orderId: string): Promise<OrderEntity> {
    return await this.orderRepository.findOneBy({ id: orderId });
  }

  async create(data: CreateOrderPayload) {
    if (!data.cartId) {
      throw new BadRequestException('Cart ID is required');
    }

    if (!data.userId) {
      throw new BadRequestException('User ID is required');
    }

    const id = randomUUID() as string;

    const order: OrderEntity = {
      id,
      user_id: data.userId,
      cart_id: data.cartId,
      total: data.total,
      status: OrderStatus.Open,
      comments: 'No comments',
      delivery: '',
      payment: '',
      items: data.items,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // const order: OrderEntity = {
    //   id,
    //   ...data,
    //   // statusHistory: [
    //   //   {
    //   //     comment: '',
    //   //     status: OrderStatus.Open,
    //   //     timestamp: Date.now(),
    //   //   },
    //   // ],
    // };

    return await this.orderRepository.save(order);
  }

  async update(orderId: string, data: OrderEntity): Promise<OrderEntity> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    Object.assign(order, data);

    return await this.orderRepository.save(order);
  }

  async deleteOrder(orderId: string): Promise<string> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order does not exist.');
    }

    const deletedOrder = await this.orderRepository.delete(orderId);

    return deletedOrder ? orderId : '0';
  }
}
