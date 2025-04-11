import { Controller, Get, Res } from "@nestjs/common";
import { HomeService } from "./home.service";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomeData(@Res() res: Response) {
    return this.homeService.getHomeData(res);
  }
}
