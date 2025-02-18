import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // 주문 생성
  async createOrder(userId: number,  payment_method: string  ) {
    try {      
      const defaultAddress = await this.prisma.shipping_address.findFirst({
        where: {
          user_id: userId,
          is_default: true
        }
      });

      if (!defaultAddress) {
        throw new BadRequestException('Shipping address is required');
      }

      // 장바구니 아이템 조회
      const cartItems = await this.prisma.cart.findMany({
        where: { user_id: userId },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 상품 정보 조회
      const productIds = cartItems.map(item => item.product_id);
      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        }
      });

      // 상품 정보 매핑
      const productMap = new Map(products.map(p => [p.id, p]));
      // 총 금액 계산
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + (productMap.get(item.product_id)?.price || 0) * item.quantity,
        0
      );

      // 트랜잭션으로 주문 생성
      const order = await this.prisma.$transaction(async (prisma) => {
        // 1. 주문 생성
        const newOrder = await prisma.orders.create({
          data: {
            user_id: userId,
            shipping_address_id: defaultAddress.id,
            total_amount: totalAmount,
            status: 'PENDING',
            payment_method: payment_method,
            payment_status: 'PENDING',
          },
        });

        // 2. 주문 아이템 생성
        await prisma.order_items.createMany({
          data: cartItems.map(item => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: productMap.get(item.product_id)?.price || 0,
          })),
        });

        // 3. 장바구니 비우기
        await prisma.cart.deleteMany({
          where: { user_id: userId },
        });

        return newOrder;
      });

      return this.getOrderById(userId, order.id);
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
        orderBy: {
          created_at: 'desc',
        },
      });

      // 주문 아이템 조회
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await this.prisma.order_items.findMany({
            where: { order_id: order.id },
          });

          const products = await this.prisma.product.findMany({
            where: {
              id: {
                in: items.map(item => item.product_id)
              }
            },
            select: {
              id: true,
              name: true,
              images: true,
            }
          });

          const productMap = new Map(products.map(p => [p.id, p]));

          return {
            ...order,
            items: items.map(item => ({
              ...item,
              product: productMap.get(item.product_id)
            }))
          };
        })
      );

      return ordersWithItems;
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
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const items = await this.prisma.order_items.findMany({
        where: { order_id: orderId },
      });

      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: items.map(item => item.product_id)
          }
        }
      });

      const productMap = new Map(products.map(p => [p.id, p]));

      return {
        ...order,
        items: items.map(item => ({
          ...item,
          product: productMap.get(item.product_id)
        }))
      };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw new Error('Failed to get order details');
    }
  }
} 