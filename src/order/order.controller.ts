import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "../auth/get-user.decorator";
import { JwtPayload } from "../auth/jwt-payload.interface";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(
    @GetUser() user: JwtPayload,
    @Body("payment_method") payment_method: string,
  ) {
    return this.orderService.createOrder(user.userId, payment_method);
  }

  @Get()
  getOrders(@GetUser() user: JwtPayload) {
    return this.orderService.getOrders(user.userId);
  }

  @Get(":id")
  getOrderById(
    @GetUser() user: JwtPayload,
    @Param("id", ParseIntPipe) orderId: number,
  ) {
    return this.orderService.getOrderById(user.userId, orderId);
  }
}
