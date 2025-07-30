-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "audit"."AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "audit"."audit_logs" (
    "id" UUID NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" VARCHAR(100) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "user_id" UUID,
    "ip_address" INET,
    "user_agent" TEXT,
    "action" "audit"."AuditAction" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "appointment_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "sent_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_auditlog_table_name" ON "audit"."audit_logs"("table_name");

-- CreateIndex
CREATE INDEX "idx_auditlog_record_id" ON "audit"."audit_logs"("record_id");

-- CreateIndex
CREATE INDEX "idx_auditlog_action" ON "audit"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_auditlog_user_id" ON "audit"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_auditlog_created_at" ON "audit"."audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_notification_user_id" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notification_appointment_id" ON "public"."notifications"("appointment_id");

-- CreateIndex
CREATE INDEX "idx_notification_is_read" ON "public"."notifications"("is_read");
