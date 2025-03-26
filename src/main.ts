import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors({
    origin: [
      'https://ecommerce-project-liart-one.vercel.app',
      'http://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  if (process.env.VERCEL) {
    await app.init();
    return app.getHttpServer();
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

let app: any;

// Vercel 서버리스 환경을 위한 핸들러
export default async function handler(req: any, res: any) {
  if (!app) {
    app = await bootstrap();
  }
  return app(req, res);
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  bootstrap();
}
