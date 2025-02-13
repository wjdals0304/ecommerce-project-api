import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async getAllBlogs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.blogService.getAllBlogs(page, pageSize);
  }

  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getBlogById(id);
  }
} 