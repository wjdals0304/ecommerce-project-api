import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @GetUser() user: JwtPayload,
    @Body() orderData: {
      shipping_address_id: number;
      items: Array<{
        product_id: number;
        quantity: number;
      }>;
    },
  ) {
    return this.orderService.createOrder(user.userId, orderData);
  }

  @Get()
  getOrders(@GetUser() user: JwtPayload) {
    return this.orderService.getOrders(user.userId);
  }

  @Get(':id')
  getOrderById(
    @GetUser() user: JwtPayload,
    @Param('id') orderId: number,
  ) {
    return this.orderService.getOrderById(user.userId, orderId);
  }
} 