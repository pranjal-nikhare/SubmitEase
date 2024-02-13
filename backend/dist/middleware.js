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
exports.authMiddleware = exports.createToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = require("jsonwebtoken");
dotenv_1.default.config();
function createToken(payload) {
    //   const secret = process.env.JWT_SECRET;
    const secret = process.env.JWT_Secret;
    //   console.log(secret);
    if (!secret) {
        throw new Error("JWT secret not found !");
    }
    const token = (0, jsonwebtoken_1.sign)(payload, secret);
    return token;
}
exports.createToken = createToken;
function authMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        if (!authHeader && !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ error: "Authorization error !" });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_Secret;
        if (!secret) {
            return res.status(500).json({ error: "Missing Auth header" });
        }
        try {
            (0, jsonwebtoken_1.verify)(token, secret);
            console.log("Token verified successfully!");
            next();
        }
        catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    });
}
exports.authMiddleware = authMiddleware;
module.exports = { authMiddleware, createToken };
