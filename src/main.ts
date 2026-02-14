import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';
import logger from './logger/logger.config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });
  const appConfig = app.get(AppConfigService);

  //----------------------- Upload-Related Setup ----------------------//
  // Ensure upload directory exists
  const uploadDir = join(process.cwd(), appConfig.uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Serve static files from the upload directory
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
  //------------------------------------------------------------------//

  //------------------------- Swagger Setup -------------------------//
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Internal API')
    .setDescription('API documentation for internal services')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  //------------------------------------------------------------------//

  //------------------------- CORS Setup ---------------------------//
  app.enableCors({
    origin: appConfig.env === 'development' || 'test',
    credentials: true,
  });
  //------------------------------------------------------------------//

  // ------------------------ Middlewares -------------------------//
  app.use(cookieParser()); // Middleware to parse cookies
  app.use(helmet()); // Middleware to set security-related HTTP headers
  //---------------------------------------------------------------//

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // transformOptions: {
      //   enableImplicitConversion: true,
      // },
    }),
  );

  await app.listen(appConfig.port);
}
void bootstrap();
