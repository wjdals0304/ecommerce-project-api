import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Warranty } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async getFilteredProducts(categoryId: number, priceMin: number, priceMax: number, warranty: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    
    console.log('Filter Params:', { categoryId, priceMin, priceMax, warranty, page, pageSize });  // 파라미터 로그
    
    const whereCondition: any = {
      price: {
        gte: priceMin || 0,
        lte: priceMax || 10000,
      },
    };

    // categoryId가 0이 아닌 경우에만 조건 추가
    if (categoryId !== 0) {
      whereCondition.categoryId = categoryId;
    }

    // warranty가 있는 경우에만 조건 추가
    if (warranty !== 'ALL') {
      whereCondition.warranty = warranty as Warranty;
    }

    // 전체 상품 수 조회
    const totalItems = await this.prisma.product.count({
      where: whereCondition
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    const products = await this.prisma.product.findMany({
      skip,
      take: pageSize,
      where: whereCondition,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        rating: true,
        soldCount: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return { 
      products, 
      categories,
      totalPages
    };
  }

  async getAllProducts(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const totalItems = await this.prisma.product.count();
    const totalPages = Math.ceil(totalItems / pageSize);

    const products = await this.prisma.product.findMany({
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        rating: true,
        soldCount: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return { 
      products, 
      categories,
      totalPages 
    };
  }
}