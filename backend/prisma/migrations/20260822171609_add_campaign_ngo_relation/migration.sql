/*
  Warnings:

  - Added the required column `ngoId` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "ngoId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
