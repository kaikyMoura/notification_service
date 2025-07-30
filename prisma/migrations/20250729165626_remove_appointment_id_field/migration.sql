/*
  Warnings:

  - You are about to drop the column `appointment_id` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."idx_notification_appointment_id";

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "appointment_id";
