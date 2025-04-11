import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, Warranty } from "@prisma/client";

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async getFilteredProducts(
    categoryId?: number,
    priceMin?: number,
    priceMax?: number,
    warranty?: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;

    const whereCondition: any = {};

    if (priceMin !== undefined || priceMax !== undefined) {
      whereCondition.price = {
        gte: priceMin || 0,
        lte: priceMax || Number.MAX_SAFE_INTEGER,
      };
    }

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    if (warranty && warranty !== "ALL") {
      whereCondition.warranty = warranty as Warranty;
    }

    const totalItems = await this.prisma.product.count({
      where: whereCondition,
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
        id: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      products,
      categories,
      totalPages,
    };
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        description: true,
        images: true,
        rating: true,
        stock: true,
        soldCount: true,
        warranty: true,
        categoryId: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // 제품 설명 데이터 조회
    const descriptions = await this.prisma.product_descriptions.findMany({
      where: {
        product_id: id,
      },
      select: {
        id: true,
        feature: true,
      },
    });

    const specifications = await this.prisma.product_specifications.findMany({
      where: {
        product_id: id,
      },
      select: {
        id: true,
        attribute: true,
        value: true,
      },
    });

    // 리뷰 카운트 조회
    const reviewCount = await this.prisma.product_reviews.count({
      where: {
        product_id: id,
      },
    });

    return {
      product: {
        ...product,
        reviewCount,
      },
      specifications,
      descriptions,
    };
  }

  async getProductReviews(id: number) {
    try {
      const reviews = await this.prisma.product_reviews.findMany({
        where: {
          product_id: id,
        },
        select: {
          id: true,
          user_name: true,
          rating: true,
          comment: true,
          created_at: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        reviews,
      };
    } catch (error) {
      console.error("Error in getProductReviews:", error);
      throw new NotFoundException("Product not found");
    }
  }

  async searchProducts(
    keyword: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const whereCondition: Prisma.productWhereInput = {
      name: {
        contains: keyword,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    // 전체 검색 결과 수 조회
    const totalItems = await this.prisma.product.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalItems / pageSize);

    // 검색 결과 조회
    const products = await this.prisma.product.findMany({
      where: whereCondition,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        rating: true,
        soldCount: true,
        description: true,
      },
      orderBy: {
        soldCount: "desc",
      },
    });

    return {
      products,
      totalPages,
    };
  }
}
