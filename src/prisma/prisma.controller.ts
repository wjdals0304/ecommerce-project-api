import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller("prisma")
export class PrismaController {
  constructor(private prisma: PrismaService) {}

  @Get("test")
  async testConnection() {
    return this.prisma.testConnection();
  }
}
