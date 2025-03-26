import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: [
      'https://ecommerce-project-liart-one.vercel.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
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
    const server = app.getHttpServer();
    return server;
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

let server: any;

// Vercel 서버리스 환경을 위한 핸들러
export default async function handler(req: any, res: any) {
  try {
    if (!server) {
      server = await bootstrap();
    }
    return server(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  bootstrap();
}
