import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getFlashDeals() {    
    return this.prisma.product.findMany({
      where: {
        isFlashDeal: true,
        NOT: {
          categoryId: 0
        },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        images: true,
        stock: true,
        soldCount: true,
      },
    });
  }

  async getEventBanners() {
    const largeBanners = await this.prisma.eventbanner.findMany({
      where: { size: 'large' },
    });

    const smallBanners = await this.prisma.eventbanner.findMany({
      where: { size: 'small' },
      take: 2,
    });

    return { largeBanners, smallBanners };
  }

  async getBestSellersByCategory() {
    // 모든 카테고리를 가져옵니다 (id가 0인 카테고리 제외)
    const categories = await this.prisma.category.findMany({
      where: {
        NOT: {
          id: 0
        },
      },
      take: 4,
    });
    
    // 각 카테고리별 베스트셀러 상품을 가져옵니다
    const categoryProducts = await Promise.all(
      categories.map(async (category) => {
        const product = await this.prisma.product.findFirst({
          where: {
            categoryId: category.id, 
          },
          orderBy: {
            soldCount: 'desc',
          },
          select: {
            id: true,
            name: true,
            images: true,
          },
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          product,
        };
      }),
    );

    return categoryProducts;
  }

  async getHotProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        rating: {
          gte: 4.5,
        },
        NOT: {
          categoryId: 0
        },
      },
      orderBy: {
        soldCount: 'desc',
      },
      take: 4,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        rating: true,
        soldCount: true,
        categoryId: true,
      },
    });

    // 카테고리 정보를 가져옵니다
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: products.map(p => p.categoryId)
        },
        NOT: {
          id: 0
        }
      }
    });

    // 카테고리 매핑을 만듭니다
    const categoryMap = categories.reduce((acc, cat) => ({
      ...acc,
      [cat.id]: cat.name
    }), {});

    return products.map(product => ({
      ...product,
      categoryName: categoryMap[product.categoryId]
    }));
  }

  async getLatestBlogs() {
    return this.prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
      select: {
        id: true,
        title: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async getCategories() {
   
    const categories = await this.prisma.category.findMany({
      where: {
        NOT: {
          id: 0
        }
      },
      take: 5,
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  }

  async getHomeData(res: any) {
    try {
        const [flashDeals, bestSellers, hotProducts, latestBlogs, eventBanners, categories] = await Promise.all([
            this.getFlashDeals(),
            this.getBestSellersByCategory(),
            this.getHotProducts(),
            this.getLatestBlogs(),
            this.getEventBanners(),
            this.getCategories(),
          ]);
      
          return res.status(HttpStatus.OK).json({
            flashDeals,
            bestSellers,
            hotProducts,
            latestBlogs,
            eventBanners,
            categories,
          });
    } catch (error) {
        throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 