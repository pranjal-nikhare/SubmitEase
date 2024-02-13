import { Request, Response, Router } from "express";
import zod from "zod";
import { createToken } from "../middleware";
// import express from "express";

const router = Router();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//student imput schema
const signUpSchema = zod.object({
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod
    .string()
    .min(8, { message: "unfulfilled password constraints" }),
  email: zod
    .string()
    .email()
    .refine((value) => value.endsWith("@mitwpu.edu.in"), {
      message: "Only mitwpu domains allowed",
    }),
});

router.post("/signup", async (req: Request, res: Response) => {
  const payload = signUpSchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: "Invalid Inputs !" });
  }

  const { firstname, lastname, password, email } = payload.data;

  await prisma.student
    .findFirst({
      where: {
        email: email,
      },
    })
    .then((user) => {
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      } else {
        prisma.student
          .create({
            data: {
              firstname,
              lastname,
              email,
              password,
            },
          })
          .then((user) => {
            const token = createToken({
              verified: "true",
              email: email,
              id: user.id,
            });
            return res.status(200).json({
              token: token,
              message: "User created",
            });
          });
      }
    });
});

//student login schema
const signInSchema = zod.object({
  // username: zod.string(),
  password: zod.string(),
  email: zod
    .string()
    .email()
    .refine((value) => value.endsWith("@mitwpu.edu.in"), {
      message: "Only mitwpu domains allowed",
    }),
});

router.post("/signin", async (req: Request, res: Response) => {
  const user = req.body;
  const validate = signInSchema.safeParse(user);

  if (!validate.success) {
    return res.status(400).json({ error: "Validation error!" });
  }

  const exists = await prisma.student.findUnique({
    where: {
      email: user.email,
      password: user.password,
    },
  });

  if (!exists) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = createToken({
    // id: exists.id,
    // verified: true,
    // username: exists.email,
    verified: true,
    email: exists.email,
    id: exists.id,
  });

  return res.status(200).json("Bearer " + token);
});

const teacherSignUpSchema = zod.object({
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
  role: zod.string(),
  email: zod
    .string()
    .email()
    .refine((value) => value.endsWith("@mitwpu.edu.in"), {
      message: "Only mitwpu domains allowed",
    }),
});

router.post("/teacherSignup", async (req: Request, res: Response) => {
  const payload = req.body;

  const validate = teacherSignUpSchema.safeParse(payload);
  if (!validate.success) {
    return res.status(400).json({ error: "Validation error!" });
  }
  if (payload.role !== "teacher") {
    return res.status(400).json({ error: "Role Error !!" });
  }

  const { firstname, lastname, password, email } = validate.data;

  const exists = await prisma.teacher.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  } else {
    prisma.teacher
      .create({
        data: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
        },
      })
      .then((teacher) => {
        const token = createToken({
          // id: teacher.id,
          // verified: true,
          // email: email,
          // role: "teacher",
          verified: true,
          email: teacher.email,
          id: teacher.id,
          role: "teacher",
        });

        // createToken({
        //   verified: "true",
        //   user: email,
        //   id: user.id,
        // });

        res.status(200).json({
          message: "user created successfully",
          token: "Bearer " + token,
        });
      });
  }
});

const teacherSignInSchema = zod.object({
  // firstname: zod.string(),
  password: zod.string(),
  role: zod.string(),
  email: zod
    .string()
    .email()
    .refine((value) => value.endsWith("@mitwpu.edu.in"), {
      message: "Only mitwpu domains allowed",
    }),
});

router.post("/teacherSignin", async (req: Request, res: Response) => {
  const teacher = req.body;
  const validate = teacherSignInSchema.safeParse(teacher);

  if (!validate.success) {
    return res.status(400).json({ error: "Validation error!" });
  }

  const { email, password } = validate.data;

  const exists = await prisma.teacher.findUnique({
    where: {
      email: email,
      password: password,
    },
  });

  if (!exists) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = createToken({
    id: exists.id,
    verified: true,
    username: exists.email,
    role: "teacher",
  });

  return res.status(200).json({
    message: "login successful",
    token: "Bearer " + token,
  });
});

export default router;
