import { Router } from "express";
import express from "express";

import userRouter from "./user";
import courseRouter from "./course";
import fetchRouter from "./fetch";
import assignmentRouter from "./course-assignments";

const router: Router = express.Router();

router.use("/user", userRouter);
router.use("/courses", courseRouter);
router.use("/fetch", fetchRouter);
router.use("/assignments", assignmentRouter);

export default router;
