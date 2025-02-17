import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { ShopModule } from './shop/shop.module';
import { BlogModule } from './blog/blog.module';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PrismaModule,
    HomeModule,
    ShopModule,
    BlogModule,
    SearchModule,
  ],
  controllers: [SearchController],
})
export class AppModule {}