import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async getProducts(
    @Query('categoryId') categoryId: number,
    @Query('priceMin') priceMin: number,
    @Query('priceMax') priceMax: number,
    @Query('warranty') warranty: string,
    @Query('page') page: number = 1,  
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.shopService.getFilteredProducts(categoryId, priceMin, priceMax, warranty, page, pageSize);
  }

  @Get('all')
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.shopService.getAllProducts(page, pageSize);
  }

  @Get(':id')
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
    @Query('tab') tab: string
  ) {
    if (tab === 'review') {
      return this.shopService.getProductReviews(id);
    }
    return this.shopService.getProductById(id);
  }
}
