-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ALERT');

-- AlterTable
ALTER TABLE "public"."notifications" ADD COLUMN     "is_scheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduled_at" TIMESTAMPTZ,
ADD COLUMN     "type" "public"."NotificationType" NOT NULL DEFAULT 'INFO';

-- CreateIndex
CREATE INDEX "idx_notification_is_scheduled" ON "public"."notifications"("is_scheduled");

-- CreateIndex
CREATE INDEX "idx_notification_scheduled_at" ON "public"."notifications"("scheduled_at");

-- CreateIndex
CREATE INDEX "idx_notification_created_at" ON "public"."notifications"("created_at");

-- CreateIndex
CREATE INDEX "idx_notification_updated_at" ON "public"."notifications"("updated_at");

-- CreateIndex
CREATE INDEX "idx_notification_deleted_at" ON "public"."notifications"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_notification_type" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "idx_notification_channel" ON "public"."notifications"("channel");
