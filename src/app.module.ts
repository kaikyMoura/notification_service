import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalInterceptor } from './infrastructure/interceptors/global.interceptor';
import { InterceptorsModule } from './infrastructure/interceptors/interceptors.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationModule } from './modules/notification/notification.module';
import {
  cacheConfig,
  cacheModuleOptions,
  databaseConfig,
  throttlerConfig,
  throttlerModuleOptions,
} from './shared/configs';
import { envSchema } from './shared/schemas/env.schema';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [cacheConfig, databaseConfig, throttlerConfig],
      isGlobal: process.env.NODE_ENV !== 'test' ? true : false,
      validationSchema: envSchema,
    }),
    CacheModule.registerAsync(cacheModuleOptions),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync(throttlerModuleOptions),
    PrismaModule,
    LoggerModule.forRoot({
      enableConsoleLogs: true,
      global: true,
    }),
    SharedModule,
    InterceptorsModule,
    HealthModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalInterceptor,
    },
  ],
})
export class AppModule {}
