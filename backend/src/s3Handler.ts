import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {} from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
