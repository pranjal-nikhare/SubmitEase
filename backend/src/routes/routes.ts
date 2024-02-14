import { Request, Response, Router } from "express";
import express from "express";
import userRouter from "./user";
import courseRouter from "./course";
// import fetchRouter from "./fetch";
import fetchRouter from "./fetch";
// const userRouter = require("./user");

const router: Router = express.Router();

router.use("/user", userRouter);
router.use("/courses", courseRouter);
router.use("/fetch", fetchRouter);

export default router;
