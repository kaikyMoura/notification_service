import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [AuditService, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}
