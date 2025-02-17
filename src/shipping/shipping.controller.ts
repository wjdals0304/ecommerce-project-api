import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('addresses')
  getAddresses(@GetUser() user: JwtPayload) {
    return this.shippingService.getAddresses(user.userId);
  }

  @Post('address')
  addAddress(
    @GetUser() user: JwtPayload,
    @Body() addressData: {
      name: string;
      phone: string;
      address: string;
      city: string;
      zipcode: string;
      memo?: string;
      is_default?: boolean;
    },
  ) {
    return this.shippingService.addAddress(user.userId, addressData);
  }

  @Put('address/:id')
  updateAddress(
    @GetUser() user: JwtPayload,
    @Param('id') id: number,
    @Body() addressData: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      zipcode?: string;
      memo?: string;
      is_default?: boolean;
    },
  ) {
    return this.shippingService.updateAddress(user.userId, id, addressData);
  }

  @Delete('address/:id')
  deleteAddress(@GetUser() user: JwtPayload, @Param('id') id: number) {
    return this.shippingService.deleteAddress(user.userId, id);
  }
} 