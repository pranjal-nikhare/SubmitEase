import { Request, Response, Router } from "express";
import zod from "zod";
import { authMiddleware } from "../middleware";
import { decode } from "jsonwebtoken";
// import express from "express";

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

      // Attempt to find an existing course
      const existingCourse = await prisma.courses.findFirst({
        where: {
          title: courseData.title,
          teacherId: teacherId,
        },
      });

      // If the course doesn't exist, create a new one
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
        // Course already exists, send appropriate response
        return res.status(200).json({
          message: "Course already exists",
          course: existingCourse, // You might want to return the existing course details here
        });
      }
    } catch (error) {
      // Handle errors such as database issues
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  // }
);

const JoinCourseSchema = zod.object({
  courseId: zod.number(),
});

router.post("/joinCourse", authMiddleware, (req: Request, res: Response) => {
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

  prisma.studentCourse.create({
    data: {
      studentId: user,
      courseID: data.courseId,
    },
  });

  return res.status(201).json({ message: "Course Joint !" });
});

export default router;
