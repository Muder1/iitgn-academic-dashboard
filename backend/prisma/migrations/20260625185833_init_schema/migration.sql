/*
  Warnings:

  - You are about to drop the column `basket` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `CourseBasket` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `basketId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourseBasket" DROP CONSTRAINT "CourseBasket_courseId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "basket",
DROP COLUMN "branch",
ADD COLUMN     "basketId" INTEGER NOT NULL,
ADD COLUMN     "branches" TEXT[];

-- DropTable
DROP TABLE "CourseBasket";

-- CreateTable
CREATE TABLE "Basket" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Basket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Basket_name_key" ON "Basket"("name");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "Basket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
