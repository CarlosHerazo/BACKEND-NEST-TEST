import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/infrastructure/filters/http-exception.filter';
import * as bodyParser from 'body-parser';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Desactivar el body parser por defecto
  });

  // Middleware para capturar raw body
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  // Get configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';

  // Enable CORS
  app.enableCors({
    origin: true, // In production, specify exact origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix (excluding documentation routes)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['api/docs', 'api/docs/(.*)', 'api/reference'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('API for product checkout with payment integration')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addTag('transactions', 'Transaction management endpoints')
    .addTag('customers', 'Customer management endpoints')
    .addTag('deliveries', 'Delivery management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Scalar API Reference (Modern Documentation UI)
  app.use(
    '/api/reference',
    apiReference({
      content: document,
    }),
  );

  // API Reference via Swagger UI
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`API Reference (Scalar): http://localhost:${port}/api/reference`);
  logger.log(`API Docs (Swagger UI): http://localhost:${port}/api/docs`);
}
bootstrap();
