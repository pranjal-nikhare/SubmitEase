"use strict";
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// const mainRouter = require("./routes/routes");
// const mainRouter
const routes_1 = __importDefault(require("./routes/routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/", routes_1.default);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});