/*
  Warnings:

  - The `endTime` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startTime` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Department" DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIME,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIME;
