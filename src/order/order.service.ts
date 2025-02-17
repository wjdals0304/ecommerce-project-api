import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // 주문 생성
  async createOrder(userId: number, data: {
    shipping_address_id: number;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
  }) {
    try {
      // 장바구니 아이템 조회
      const cartItems = await this.prisma.cart.findMany({
        where: { user_id: userId },
        include: {
          product: true,
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 총 금액 계산
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      // 트랜잭션으로 주문 생성
      const order = await this.prisma.$transaction(async (prisma) => {
        // 1. 주문 생성
        const newOrder = await prisma.orders.create({
          data: {
            user_id: userId,
            shipping_address_id: data.shipping_address_id,
            total_amount: totalAmount,
            status: 'PENDING',
          },
        });

        // 2. 주문 아이템 생성
        await prisma.order_items.createMany({
          data: cartItems.map(item => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        });

        // 3. 장바구니 비우기
        await prisma.cart.deleteMany({
          where: { user_id: userId },
        });

        return newOrder;
      });

      return order;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw new Error('Failed to create order');
    }
  }

  // 주문 내역 조회
  async getOrders(userId: number) {
    try {
      const orders = await this.prisma.orders.findMany({
        where: { user_id: userId },
        include: {
          order_items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
          shipping_address: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return orders;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw new Error('Failed to get orders');
    }
  }

  // 주문 상세 조회
  async getOrderById(userId: number, orderId: number) {
    try {
      const order = await this.prisma.orders.findFirst({
        where: {
          id: orderId,
          user_id: userId,
        },
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
          shipping_address: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw new Error('Failed to get order details');
    }
  }
} 