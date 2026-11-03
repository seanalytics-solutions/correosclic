/*
  Warnings:

  - You are about to alter the column `resetPasswordTokenHash` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(2551)` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "resetPasswordTokenHash" SET DATA TYPE VARCHAR(255);
