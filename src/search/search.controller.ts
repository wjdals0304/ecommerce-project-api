import { Controller, Get, Query } from '@nestjs/common';
import { ShopService } from '../shop/shop.service';

@Controller('search')
export class SearchController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
  ) {
    return this.shopService.searchProducts(keyword, page, size);
  }
} 