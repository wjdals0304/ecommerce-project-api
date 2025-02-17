import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@GetUser() user: JwtPayload) {
    return this.cartService.getCart(user.userId);
  }

  @Post('add')
  addToCart(
    @GetUser() user: JwtPayload,
    @Body() body: { productId: number; quantity?: number }
  ) {
    return this.cartService.addToCart(user.userId, body.productId, body.quantity);
  }

  @Put(':productId')
  updateQuantity(
    @GetUser() user: JwtPayload,
    @Param('productId') productId: number,
    @Body() body: { quantity: number }
  ) {
    return this.cartService.updateQuantity(user.userId, productId, body.quantity);
  }

  @Delete(':productId')
  removeFromCart(
    @GetUser() user: JwtPayload,
    @Param('productId') productId: number
  ) {
    return this.cartService.removeFromCart(user.userId, productId);
  }
} 