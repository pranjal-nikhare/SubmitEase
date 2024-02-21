import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
dotenv.config();

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.region || "",
  credentials: {
    accessKeyId: process.env.accessKeyId || "",
    secretAccessKey: process.env.secretAccessKey || "",
  },
});

export async function createUploadURL(
  filename: string,
  contentType: string,
  location: string
) {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 2);

  const command = new PutObjectCommand({
    Bucket: process.env.Bucket || "",
    Key: `submissions/${location}/${filename}`,
    ContentType: contentType,
    // Expires: expirationTime,
  });

  const url = getSignedUrl(s3Client, command);
  return url;
}

export async function getUploads(path: string) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.Bucket || "",
    Prefix: path,
  });
  const result = await s3Client.send(command);
  return result;
}
