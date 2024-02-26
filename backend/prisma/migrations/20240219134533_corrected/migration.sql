/*
  Warnings:

  - You are about to drop the `CourseAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseAssignment" DROP CONSTRAINT "CourseAssignment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "CourseAssignment" DROP CONSTRAINT "CourseAssignment_courseId_fkey";

-- DropTable
DROP TABLE "CourseAssignment";
