/*
  Warnings:

  - You are about to drop the column `timeIn` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `timeOut` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,date,type]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `time` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('IN', 'OUT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'EARLY_OUT';
ALTER TYPE "AttendanceStatus" ADD VALUE 'OVERTIME';

-- DropIndex
DROP INDEX "public"."Attendance_userId_date_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "timeIn",
DROP COLUMN "timeOut",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "AttendanceType" NOT NULL,
ALTER COLUMN "date" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_type_key" ON "Attendance"("userId", "date", "type");
