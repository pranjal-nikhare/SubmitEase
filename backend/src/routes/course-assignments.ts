import { Request, Response, Router } from "express";
import zod, { boolean } from "zod";
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
    try {
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

      const newAssignment = await prisma.assignment.create({
        data: {
          title: payload.data.title,
          description: payload.data.description,
          dueDate,
          course: {
            connect: {
              id: payload.data.courseId,
            },
          },
        },
      });

      return res.status(201).json(newAssignment);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//create a submission - student
// import multer from "multer";

const submissionSchema = zod.object({
  assignmentId: zod.string(),
});

router.post("/uploadSubmission", authMiddleware, async (req, res) => {
  const data = req.body;
  const payload = submissionSchema.safeParse(data);

  if (!payload.success) {
    return res.status(400).json({ error: "Validation error !" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token unavailable !" });
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = decode(token);
  const studentId = decoded.studentId;

  const exists = prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });

  if (!exists) {
    return res.status(401).json({
      error: "User doesn't exist",
    });
  }

  const assignment = await prisma.assignment.findUnique({
    where: {
      id: payload.data.assignmentId,
    },
    include: {
      course: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!assignment)
    return res.status(404).json({
      error: "Assignment not found",
    });

  // const x = assignment.

  //get all students in the course
  const allStudents = assignment.course?.students;

  if (!allStudents)
    return res.status(400).json({ message: "Internal server error" });

  //verify if stud exists in course
  var found: boolean = false;
  allStudents.forEach((element) => {
    if (element.studentId === studentId) {
      found = true;
    }
  });

  if (found === false)
    return res.status(401).json({
      message: "Student is not enrolled in the course",
    });

  //creating submission

  const newSubmission = prisma.submission.create({
    data: {
      grade: 0,
      data: "#data ",
      student: {
        connect: {
          id: studentId,
        },
      },
      assignment: {
        connect: {
          id: assignment.id,
        },
      },
    },
  });
});

//get all assignments by course

//get all assignments by student **

//view all submissions for assignment by all students

export default router;
