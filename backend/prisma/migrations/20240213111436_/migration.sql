/*
  Warnings:

  - A unique constraint covering the columns `[title,teacherId]` on the table `Courses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherId` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_id_fkey";

-- AlterTable
-- ALTER TABLE "Courses" ADD COLUMN     "teacherId" NOT NULL DEFAULT 'default_teacher_id';
ALTER TABLE "Courses" ADD COLUMN "teacherId" TEXT NOT NULL DEFAULT 'default_teacher_id';

-- CreateIndex
CREATE UNIQUE INDEX "Courses_title_teacherId_key" ON "Courses"("title", "teacherId");

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
