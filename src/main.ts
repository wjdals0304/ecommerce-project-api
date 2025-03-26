import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
    
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

    if (!process.env.VERCEL) {
      const port = process.env.PORT || 3001;
      await app.listen(port);
      console.log(`Application is running on port ${port}`);
    } else {
      await app.init();
    }
  }
  
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await bootstrap();
    const httpAdapter = app.getHttpAdapter();
    return httpAdapter.getInstance()(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  bootstrap();
}
