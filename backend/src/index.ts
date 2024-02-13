// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

import express, { Express } from "express";
import cors from "cors";

// const mainRouter = require("./routes/routes");
// const mainRouter
import mainRouter from "./routes/routes";
const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/", mainRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
