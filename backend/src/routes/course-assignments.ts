import { Request, Response, Router } from "express";
import zod from "zod";
import { authMiddleware } from "../middleware";
import { decode } from "jsonwebtoken";

const router = Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//create an assignment
const createAssignmentSchema = zod.object({
  title: zod.string(),
  description: zod.string(),
  dueDate: zod.string(),
  courseId: zod.string(),
});

router.post(
  "/createassignment",
  authMiddleware,
  async (req: Request, res: Response) => {
    const data = req.body;
    const payload = createAssignmentSchema.safeParse(data);
    if (!payload.success) {
      return res.status(400).json({ error: "Validation error !" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token unavailable !" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = decode(token);
    const teacherId = decoded.id;

    const course = await prisma.courses.findUnique({
      where: {
        id: payload.data.courseId,
        teacherId: teacherId,
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const dueDate = new Date(payload.data.dueDate);

    // const newAssignment = await prisma.assignment.create({
    //   data: {
    //     title: payload.data.title,
    //     description: payload.data.description,
    //     dueDate,
    //     course: {
    //       connect: {
    //         id: payload.data.courseId,
    //       },
    //     },
    //   },
    // });

    // const newCourseAssignment = await prisma.courseAssignment.create({
    //   data: {
    //     courseId: payload.data.courseId,
    //     assignmentId: newAssignment.id,
    //   },
    // });

    const theAssi = await prisma.courseAssignment.findFirst({
      where: {
        courseId: payload.data.courseId,
      },
    });

    const datta = await prisma.courseAssignment.findMany();
    console.log("The Data:", datta);

    const asses = await prisma.courses.findMany({
      include: {
        CourseAssignment: true,
      },
    });

    console.log("The Asses:", asses);

    console.log("The Assignment:", theAssi);
    // return res.status(201).json(newAssignment);
    return res.status(201).json("jkjk");
  }
);

// router.get()

//create a submission

//get all assignments by course

//get all assignments by student **

//view all submissions for assignment by all students

export default router;
