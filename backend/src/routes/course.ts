import { Request, Response, Router } from "express";
import zod from "zod";
import { authMiddleware } from "../middleware";
import { decode } from "jsonwebtoken";

const router = Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createCourseSchema = zod.object({
  title: zod.string(),
  description: zod.string(),
});

router.post(
  "/createcourse",
  authMiddleware,
  async (req: Request, res: Response) => {
    const courseData = req.body;

    // Validate the request body
    const validate = createCourseSchema.safeParse(courseData);
    if (!validate.success) {
      return res.status(400).json({ error: "Validation error !" });
    }

    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    // Decode the token to get user data
    const token = authHeader.split(" ")[1];
    const data: any = decode(token);
    const teacherId = data.id;

    try {
      // Check if the teacher exists
      const teacher = await prisma.teacher.findUnique({
        where: {
          id: teacherId,
        },
      });

      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      // find if course exists
      const existingCourse = await prisma.courses.findFirst({
        where: {
          title: courseData.title,
          teacherId: teacherId,
        },
      });

      // If the course doesn't exist... create a new one
      if (!existingCourse) {
        const newCourse = await prisma.courses.create({
          data: {
            title: courseData.title,
            description: courseData.description,
            teacher: {
              connect: {
                id: teacherId,
              },
            },
          },
        });

        return res.status(201).json({
          message: "Course created successfully",
          course: newCourse,
        });
      } else {
        // Course already exists...send appropriate response
        return res.status(200).json({
          message: "Course already exists",
          course: existingCourse,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

const JoinCourseSchema = zod.object({
  courseId: zod.string(),
});

router.post(
  "/joinCourse",
  authMiddleware,
  async (req: Request, res: Response) => {
    const data = req.body;
    const validate = JoinCourseSchema.safeParse(data);
    if (!validate.success) {
      return res.status(400).json({ error: "Validation error !" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    const token = authHeader.split(" ")[1];
    const payload: any = decode(token);
    const user = payload.id;

    const stud = await prisma.student.findUnique({
      where: {
        id: user,
      },
      include: {
        enrolledCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    const isEnrolled = stud?.enrolledCourses.some(
      (course) => course.courseID === data.courseId
    );

    if (isEnrolled) {
      return res.status(400).json({ error: "Already joint !" });
    }

    await prisma.studentCourse.create({
      data: {
        student: {
          connect: {
            id: user,
          },
        },

        course: {
          connect: {
            id: data.courseId,
          },
        },
      },
    });

    return res.status(201).json({ message: "Course Joint !" });
  }
);

export default router;
