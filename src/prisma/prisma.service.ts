import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log(Object.keys(this));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
