import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";

// 전역 인스턴스를 캐시
let cachedApp: NestExpressApplication;
let cachedServer: any;

async function bootstrap() {
  if (!cachedApp) {
    console.log("Initializing NestJS application...");

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ["error", "warn"], // 로깅 최소화
      bufferLogs: true,
    });

    const allowedOrigins = [
      "https://ecommerce-project-liart-one.vercel.app",
      "http://localhost:3000",
    ];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      allowedHeaders: ["Content-Type", "Accept", "Authorization"],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // 보안 헤더 설정
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header(
          "Access-Control-Allow-Methods",
          "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Accept, Authorization",
        );
        res.header("Access-Control-Allow-Credentials", "true");
      }
      next();
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    if (process.env.VERCEL) {
      await app.init();
      cachedServer = app.getHttpAdapter().getInstance();
    } else {
      const port = process.env.PORT || 3001;
      await app.listen(port);
      console.log(`Application is running on port ${port}`);
    }

    cachedApp = app;
  }

  return process.env.VERCEL ? cachedServer : cachedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://ecommerce-project-liart-one.vercel.app",
      "http://localhost:3000",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Accept, Authorization",
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // OPTIONS 요청 처리
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

// 로컬 환경에서 서버 실행
if (!process.env.VERCEL) {
  void bootstrap();
}
