/*
  Warnings:

  - You are about to drop the column `admissionYear` on the `CurriculumRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `basketName` on the `CurriculumRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `discipline` on the `CurriculumRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `requiredCredits` on the `CurriculumRequirement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[branch,cohortStart,basketId]` on the table `CurriculumRequirement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `basketId` to the `CurriculumRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branch` to the `CurriculumRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cohortEnd` to the `CurriculumRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cohortStart` to the `CurriculumRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditsTarget` to the `CurriculumRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CurriculumRequirement_admissionYear_discipline_basketName_key";

-- AlterTable
ALTER TABLE "CurriculumRequirement" DROP COLUMN "admissionYear",
DROP COLUMN "basketName",
DROP COLUMN "discipline",
DROP COLUMN "requiredCredits",
ADD COLUMN     "basketId" INTEGER NOT NULL,
ADD COLUMN     "branch" TEXT NOT NULL,
ADD COLUMN     "cohortEnd" INTEGER NOT NULL,
ADD COLUMN     "cohortStart" INTEGER NOT NULL,
ADD COLUMN     "creditsTarget" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumRequirement_branch_cohortStart_basketId_key" ON "CurriculumRequirement"("branch", "cohortStart", "basketId");

-- AddForeignKey
ALTER TABLE "CurriculumRequirement" ADD CONSTRAINT "CurriculumRequirement_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "Basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
