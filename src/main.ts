import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LOGGER_SERVICE } from './infrastructure/logger/logger.constants';
import { ILoggerService } from './infrastructure/logger/interfaces/logger.service.interface';
import { MemoryMonitor } from './shared/utils/memory-monitor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get<ILoggerService>(LOGGER_SERVICE);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
  });

  const port = configService.get<number>('PORT', 5000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  const memoryMonitor = app.get(MemoryMonitor);
  if (memoryMonitor) {
    memoryMonitor?.logMemoryUsageWithContext?.('APPLICATION_START', {
      detailed: true,
    });
  }

  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );

  app.use(compression());

  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') ?? [];

  if (nodeEnv === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
  }

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Swagger documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Notification Service API')
      .setDescription(
        `
        🔐 **Notification Service API** - Secure notification service backend
        
        ## Features
        - Send notifications to users
        - Send notifications to groups
        - Send notifications to all users in a group
        - Send notifications to all groups in a group
        - Send notifications to all users in a group
        
        ## Authentication
        Most endpoints require authentication. Use the JWT token from login/register endpoints in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Error Handling
        All errors return consistent JSON responses with appropriate HTTP status codes.
      `,
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token from login/register endpoints',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Notification', 'Notification endpoints')
      .addServer(`http://localhost:${port}`, 'Development server')
      .addServer('https://api.example.com', 'Production server')
      .setContact('Kaiky Tupinambá', 'https://github.com/kaikyMoura', 'kaikydev@gmail.com')
      .setLicense('UNLICENSED', 'https://github.com/kaikyMoura/notification_service')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Notification Service API Documentation',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; }
        .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
      `,
    });
    logger.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);
  }

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

  await app.startAllMicroservices();

  app.enableShutdownHooks();

  await app.listen(port ?? 5000);

  logger.log(`🚀 Notification service is running on port ${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🔗 API Base URL: http://localhost:${port}`);
  if (nodeEnv !== 'production') {
    logger.log(`📖 API Documentation: http://localhost:${port}/docs`);
  }
}
void bootstrap();
