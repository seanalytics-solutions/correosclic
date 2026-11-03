-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "resetPasswordExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordTokenHash" VARCHAR(2551);
