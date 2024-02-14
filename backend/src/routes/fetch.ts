import { Express, Request, Response, Router } from "express";
// import zod from "zod";
import { authMiddleware } from "../middleware";
import { decode } from "jsonwebtoken";

const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//get student's all courses
router.get(
  "/mycourses",
  authMiddleware,
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    const token = authHeader.split(" ")[1];
    const data: any = decode(token);
    const studentId = data.id;

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        enrolledCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    // console.log(student);

    // const courses = student.enrolledCourses.map((course) => {
    //   //   return course.course;
    //   //   console.log(course.course);
    //   //   console.log(course);
    //   const courseData = {
    //     id: course.course.id,
    //     title: course.course.title,
    //     description: course.course.description,
    //   };
    //   return course;
    //   return res.status(200).json(courseData);
    // });

    // const courses = student.enrolledCourses.map()
    const courses = student.enrolledCourses.map((enrolledCourse) => ({
      studentId: enrolledCourse.studentId,
      // courseID: enrolledCourse.courseID,
      course: {
        id: enrolledCourse.course.id,
        title: enrolledCourse.course.title,
        description: enrolledCourse.course.description,
      },
    }));

    return res.status(200).json(courses);

    // }
    // return res.status
    // const courseData =
    return res.status(200).json(courses);
  }
);

export default router;
