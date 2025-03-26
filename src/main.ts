import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express();
let app: NestExpressApplication;

async function bootstrap() {
  try {
    if (!app) {
      app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(expressApp)
      );
      
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

      await app.init();
    }

    if (process.env.VERCEL) {
      return expressApp;
    }

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
    return app;
  } catch (error) {
    console.error('Bootstrap error:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    console.log('Incoming request:', req.method, req.url);
    
    const server = await bootstrap() as express.Express;
    console.log('Server initialized successfully');
    
    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  bootstrap().catch(err => {
    console.error('Local server error:', err);
    process.exit(1);
  });
}
