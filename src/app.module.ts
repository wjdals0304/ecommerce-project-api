import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HomeModule } from "./home/home.module";
import { ShopModule } from "./shop/shop.module";
import { BlogModule } from "./blog/blog.module";
import { SearchController } from "./search/search.controller";
import { SearchModule } from "./search/search.module";
import { CartModule } from "./cart/cart.module";
import { ShippingModule } from "./shipping/shipping.module";
import { OrderModule } from "./order/order.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuthModule,
    PrismaModule,
    HomeModule,
    ShopModule,
    BlogModule,
    SearchModule,
    CartModule,
    ShippingModule,
    OrderModule,
  ],
  controllers: [SearchController],
})
export class AppModule {}
