import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ["query", "info", "warn", "error"],
      errorFormat: "pretty",
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log("Successfully connected to the database");
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 연결 테스트 메서드 추가
  async testConnection() {
    try {
      await this.$queryRaw`SELECT 1`;
      console.log("Database connection successful! ✅");
      return true;
    } catch (error) {
      console.error("Database connection failed! ❌");
      console.error("Error:", error);
      return false;
    }
  }
}
