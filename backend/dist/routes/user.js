"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const middleware_1 = require("../middleware");
// import express from "express";
const router = (0, express_1.Router)();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//student imput schema
const signUpSchema = zod_1.default.object({
    firstname: zod_1.default.string(),
    lastname: zod_1.default.string(),
    password: zod_1.default
        .string()
        .min(8, { message: "unfulfilled password constraints" }),
    email: zod_1.default
        .string()
        .email()
        .refine((value) => value.endsWith("@mitwpu.edu.in"), {
        message: "Only mitwpu domains allowed",
    }),
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = signUpSchema.safeParse(req.body);
    if (!payload.success) {
        return res.status(400).json({ error: "Invalid Inputs !" });
    }
    const { firstname, lastname, password, email } = payload.data;
    yield prisma.student
        .findFirst({
        where: {
            email: email,
        },
    })
        .then((user) => {
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }
        else {
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
                const token = (0, middleware_1.createToken)({
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
}));
//student login schema
const signInSchema = zod_1.default.object({
    // username: zod.string(),
    password: zod_1.default.string(),
    email: zod_1.default
        .string()
        .email()
        .refine((value) => value.endsWith("@mitwpu.edu.in"), {
        message: "Only mitwpu domains allowed",
    }),
});
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const validate = signInSchema.safeParse(user);
    if (!validate.success) {
        return res.status(400).json({ error: "Validation error!" });
    }
    const exists = yield prisma.student.findUnique({
        where: {
            email: user.email,
            password: user.password,
        },
    });
    if (!exists) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = (0, middleware_1.createToken)({
        // id: exists.id,
        // verified: true,
        // username: exists.email,
        verified: true,
        email: exists.email,
        id: exists.id,
    });
    return res.status(200).json("Bearer " + token);
}));
const teacherSignUpSchema = zod_1.default.object({
    firstname: zod_1.default.string(),
    lastname: zod_1.default.string(),
    password: zod_1.default.string(),
    role: zod_1.default.string(),
    email: zod_1.default
        .string()
        .email()
        .refine((value) => value.endsWith("@mitwpu.edu.in"), {
        message: "Only mitwpu domains allowed",
    }),
});
router.post("/teacherSignup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const validate = teacherSignUpSchema.safeParse(payload);
    if (!validate.success) {
        return res.status(400).json({ error: "Validation error!" });
    }
    if (payload.role !== "teacher") {
        return res.status(400).json({ error: "Role Error !!" });
    }
    const { firstname, lastname, password, email } = validate.data;
    const exists = yield prisma.teacher.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (exists) {
        return res.status(400).json({ error: "User already exists" });
    }
    else {
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
            const token = (0, middleware_1.createToken)({
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
}));
const teacherSignInSchema = zod_1.default.object({
    // firstname: zod.string(),
    password: zod_1.default.string(),
    role: zod_1.default.string(),
    email: zod_1.default
        .string()
        .email()
        .refine((value) => value.endsWith("@mitwpu.edu.in"), {
        message: "Only mitwpu domains allowed",
    }),
});
router.post("/teacherSignin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = req.body;
    const validate = teacherSignInSchema.safeParse(teacher);
    if (!validate.success) {
        return res.status(400).json({ error: "Validation error!" });
    }
    const { email, password } = validate.data;
    const exists = yield prisma.teacher.findUnique({
        where: {
            email: email,
            password: password,
        },
    });
    if (!exists) {
        return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = (0, middleware_1.createToken)({
        id: exists.id,
        verified: true,
        username: exists.email,
        role: "teacher",
    });
    return res.status(200).json({
        message: "login successful",
        token: "Bearer " + token,
    });
}));
exports.default = router;
