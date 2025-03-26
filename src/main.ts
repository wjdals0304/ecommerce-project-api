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

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
  return app;
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  bootstrap();
}

// Vercel 서버리스 환경을 위한 핸들러
let cachedServer: unknown;

export default async function handler(req: unknown, res: unknown): Promise<void> {
  if (!cachedServer) {
    const app = await bootstrap();
    cachedServer = app.getHttpServer();
  }
  if (cachedServer && typeof cachedServer === 'function') {
    return cachedServer(req, res);
  }
  throw new Error('Server initialization failed');
}
