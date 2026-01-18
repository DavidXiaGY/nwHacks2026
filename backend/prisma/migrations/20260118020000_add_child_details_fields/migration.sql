-- AlterTable
ALTER TABLE "Child" ADD COLUMN "gender" TEXT,
ADD COLUMN "clothingShirtSize" TEXT,
ADD COLUMN "clothingPantSize" TEXT,
ADD COLUMN "clothingShoeSize" TEXT,
ADD COLUMN "clothingToyPreference" TEXT,
ADD COLUMN "interests" TEXT,
ADD COLUMN "notes" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
