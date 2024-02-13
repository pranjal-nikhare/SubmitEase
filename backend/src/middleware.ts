import dotenv from "dotenv";
import { verify, sign } from "jsonwebtoken";

dotenv.config();

export function createToken(payload: object): string {
  //   const secret = process.env.JWT_SECRET;

  const secret = process.env.JWT_Secret;
  //   console.log(secret);
  if (!secret) {
    throw new Error("JWT secret not found !");
  }

  const token = sign(payload, secret);
  return token;
}

export async function authMiddleware(req: any, res: any, next: any) {
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
    verify(token, secret);
    console.log("Token verified successfully!");
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authMiddleware, createToken };
