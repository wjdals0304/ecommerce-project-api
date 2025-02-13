import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getAllBlogs(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const totalItems = await this.prisma.blog.count();
    const totalPages = Math.ceil(totalItems / pageSize);

    const blogs = await this.prisma.blog.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
      },
    });

    return { 
      blogs,
      totalPages
    };
  }

  async getRecentPosts(limit: number = 5) {
    const recentPosts = await this.prisma.blog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        image: true,
        createdAt: true,
      },
    });

    return { recentPosts };
  }

  async getBlogById(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        createdAt: true,
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const recentPosts = await this.getRecentPosts(5);

    return { 
      blog,
      recentPosts: recentPosts.recentPosts
    };
  }
} 