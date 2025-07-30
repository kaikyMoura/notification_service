import { Injectable } from '@nestjs/common';
import { AuditLog } from 'prisma/app/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditData = Omit<AuditLog, 'id' | 'createdAt'> & {
  oldValues: any;
  newValues: any;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs the audit data.
   * @param auditData - The audit data to log.
   * @returns A promise that resolves when the audit is logged.
   */
  async logAudit(auditData: AuditData): Promise<void> {
    await this.prisma.auditLog.create({
      data: auditData,
    });
  }
}
