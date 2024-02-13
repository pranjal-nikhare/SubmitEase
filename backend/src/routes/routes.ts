import { Request, Response, Router } from "express";
import express from "express";
import userRouter from "./user";
import courseRouter from "./course";
// const userRouter = require("./user");

const router: Router = express.Router();

router.use("/user", userRouter);
router.use("/courses", courseRouter);

export default router;
