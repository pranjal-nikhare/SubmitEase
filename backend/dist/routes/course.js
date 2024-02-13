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
const jsonwebtoken_1 = require("jsonwebtoken");
// import express from "express";
const router = (0, express_1.Router)();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createCourseSchema = zod_1.default.object({
    title: zod_1.default.string(),
    description: zod_1.default.string(),
});
router.post("/createcourse", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const data = (0, jsonwebtoken_1.decode)(token);
    const teacherId = data.id;
    try {
        // Check if the teacher exists
        const teacher = yield prisma.teacher.findUnique({
            where: {
                id: teacherId,
            },
        });
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        // Attempt to find an existing course
        const existingCourse = yield prisma.courses.findFirst({
            where: {
                title: courseData.title,
                teacherId: teacherId,
            },
        });
        // If the course doesn't exist, create a new one
        if (!existingCourse) {
            const newCourse = yield prisma.courses.create({
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
        }
        else {
            // Course already exists, send appropriate response
            return res.status(200).json({
                message: "Course already exists",
                course: existingCourse, // You might want to return the existing course details here
            });
        }
    }
    catch (error) {
        // Handle errors such as database issues
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
})
// }
);
const JoinCourseSchema = zod_1.default.object({
    courseId: zod_1.default.number(),
});
router.post("/joinCourse", middleware_1.authMiddleware, (req, res) => {
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
    const payload = (0, jsonwebtoken_1.decode)(token);
    const user = payload.id;
    prisma.studentCourse.create({
        data: {
            studentId: user,
            courseID: data.courseId,
        },
    });
    return res.status(201).json({ message: "Course Joint !" });
});
exports.default = router;
