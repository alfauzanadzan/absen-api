/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `Attendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[qrValue]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `qrValue` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Made the column `date` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'KAPROG', 'PEKERJA');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'COMPLETED', 'ABSENT');

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "fk_user";

-- AlterTable
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_pkey",
ADD COLUMN     "qrValue" TEXT NOT NULL,
ADD COLUMN     "role" "public"."UserRole" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timeIn" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timeOut" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'PEKERJA',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "public"."Role";

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_qrValue_key" ON "public"."Attendance"("qrValue");

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
