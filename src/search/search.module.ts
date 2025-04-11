import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { ShopModule } from "../shop/shop.module";

@Module({
  imports: [ShopModule],
  controllers: [SearchController],
})
export class SearchModule {}
