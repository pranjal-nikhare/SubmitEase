import { Express, Request, Response, Router } from "express";
import zod from "zod";
import { authMiddleware } from "../middleware";
import { decode } from "jsonwebtoken";

const router = Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//get all courses
router.get(
  "/allcourses",
  authMiddleware,
  async (req: Request, res: Response) => {
    const allCourses = await prisma.courses.findMany({
      include: { teacher: true },
    });

    const data = await Promise.all(
      allCourses.map(async (course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        teacher: course.teacher,
      }))
    );
    return res.status(200).json(data);
  }
);

//get courses created by the teacher

router.get(
  "/createdcourses",
  authMiddleware,
  async (req: Request, res: Response) => {
    const authheader = req.headers.authorization;
    if (!authheader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    const token = authheader.split(" ")[1];
    const data: any = decode(token);

    const courses = await prisma.teacher.findUnique({
      where: {
        id: data.id,
      },
      include: {
        createdCourses: true,
      },
    });

    const resp = courses?.createdCourses;
    return res.status(200).json(resp);
  }
);

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
  }
);

//get all students in the course - teacher

const getStudentsSchema = zod.object({
  courseId: zod.string(),
});

router.get(
  "/getstudents",
  authMiddleware,
  async (req: Request, res: Response) => {
    const payload = req.body;
    const validate = getStudentsSchema.safeParse(payload);
    if (!validate.success) {
      return res.status(400).json({ error: "Validation error !" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    const token = authHeader.split(" ")[1];
    const data: any = decode(token);

    const course = await prisma.courses.findUnique({
      where: {
        id: payload.courseId,
      },
    });
    console.log("Course:", course); // Log the course information

    if (!course) {
      return res.status(404).json({ error: "Course not found !" });
    }

    const studentsEnrolled = await prisma.studentCourse.findMany({
      where: {
        courseID: payload.courseId, // Filter by courseId
      },
      include: {
        student: true,
      },
    });
    console.log("Students enrolled:", studentsEnrolled); // Log the students enrolled in the course

    const students = studentsEnrolled.map((enrollment) => enrollment.student);
    console.log("Mapped students:", students); // Log the mapped students

    return res.status(200).json(students);
  }
);

export default router;
