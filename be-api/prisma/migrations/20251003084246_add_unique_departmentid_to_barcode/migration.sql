/*
  Warnings:

  - A unique constraint covering the columns `[departmentId]` on the table `Barcode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Barcode_departmentId_key" ON "Barcode"("departmentId");
