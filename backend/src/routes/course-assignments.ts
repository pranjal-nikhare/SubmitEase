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

import { createUploadURL, getUploads } from "../s3Handler";

const submissionSchema = zod.object({
  assignmentId: zod.string(),
  //edgecase
  filetype: zod.string(),
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
  // console.log(decoded);
  const studentId = decoded.id;

  // console.log(studentId);

  const exists = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
  });
  console.log(exists);

  if (!exists) {
    return res.status(401).json({
      error: "User doesn't exist",
    });
  }
  // const idd = exists.id;

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
  console.log(allStudents);
  allStudents.forEach((element) => {
    if (element.studentId === studentId) {
      found = true;
    }
  });

  if (!found)
    return res.status(401).json({
      message: "Student is not enrolled in the course",
    });

  //creating submission
  const newSubmission = prisma.submission.create({
    data: {
      grade: 0,
      data: "temp",
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

  const filename = (await newSubmission).id + "." + payload.data.filetype;
  const courseId = assignment.courseId;
  const assignmentId = assignment.id;

  const path = courseId + "/" + assignmentId;

  console.log(path);
  console.log(payload.data.filetype);
  console.log(filename);

  const url = await createUploadURL(filename, payload.data.filetype, path);
  console.log(url);

  res.status(200).json({
    uploadPath: url,
  });

  //ensuring if file uploaded

  verifier(path, filename, res);

  // let uploaded = false;
  // let time = 0;

  // let intervalId = setInterval(async () => {
  //   let data = await getUploads(path);
  //   data.Contents?.forEach((element) => {
  //     if (element.Key === path + filename) {
  //       uploaded = true;
  //     } else if (time > 120000) {
  //       clearInterval(intervalId);
  //       return res.status(400).json({ message: "Upload Error !" });
  //     }
  //     if (uploaded) {
  //       clearInterval(intervalId);
  //     }
  //     time += 10000;
  //   });
  // }, 10000);

  const updatedSubmission = prisma.submission.update({
    where: {
      id: (await newSubmission).id,
    },
    data: {
      data: path + filename,
    },
  });

  // return res.status(200).json({ message: "Upload successful" });
});

//get all assignments by course

//get all assignments by student **

//view all submissions for assignment by all students

export default router;

async function verifier(path: string, filename: string, res: Response) {
  let uploaded = false;
  let time = 0;
  console.log("inside verifier");
  let intervalId = setInterval(async () => {
    console.log("one1");
    let data = await getUploads(path);
    console.log(data);
    data.Contents?.forEach((element) => {
      if (element.Key === path + filename) {
        uploaded = true;
      } else if (time > 120000) {
        clearInterval(intervalId);
        return res.status(400).json({ message: "Upload Error !" });
      }
      if (uploaded) {
        console.log("Uploaded");
        clearInterval(intervalId);
      }
      time += 10000;
    });
  }, 10000);
}
