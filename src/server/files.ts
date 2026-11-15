import "server-only";
import { createHash } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AppError } from "@/server/errors";

const MAX_RESUME = 5 * 1024 * 1024;
const MAX_PHOTO = 2 * 1024 * 1024;

export function validateResume(bytes: Buffer, fileName: string) {
  if (bytes.length === 0 || bytes.length > MAX_RESUME) {
    throw new AppError("Resume must be a PDF or DOCX under 5 MB.");
  }
  const lower = fileName.toLowerCase();
  const pdf = bytes.subarray(0, 4).toString("utf8") === "%PDF";
  const docx = bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (lower.endsWith(".pdf") && pdf) return "application/pdf";
  if ((lower.endsWith(".docx") || lower.endsWith(".doc")) && docx) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  throw new AppError("Upload a PDF or DOCX resume.");
}

export function validatePhoto(bytes: Buffer, fileName: string) {
  if (bytes.length === 0 || bytes.length > MAX_PHOTO) {
    throw new AppError("Profile photo must be a JPG or PNG under 2 MB.");
  }
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const lower = fileName.toLowerCase();
  if ((lower.endsWith(".jpg") || lower.endsWith(".jpeg")) && jpeg) return "image/jpeg";
  if (lower.endsWith(".png") && png) return "image/png";
  throw new AppError("Upload a JPG or PNG photograph.");
}

function cloudinaryConfig() {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) return null;
  const url = new URL(raw);
  if (!url.username || !url.password || !url.hostname) return null;
  return { key: url.username, secret: url.password, cloud: url.hostname };
}

function s3Config() {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    client: new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export async function storeBytes(userId: string, fileName: string, mimeType: string, bytes: Buffer) {
  const cloudinary = cloudinaryConfig();
  if (cloudinary) {
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `timestamp=${timestamp}${cloudinary.secret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");
    const body = new FormData();
    body.append("file", new Blob([new Uint8Array(bytes)]), fileName);
    body.append("api_key", cloudinary.key);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloud}/auto/upload`, {
      method: "POST",
      body,
    });
    if (!response.ok) throw new AppError("File storage is unavailable.", 502);
    const payload = (await response.json()) as { public_id?: string };
    if (!payload.public_id) throw new AppError("File storage is unavailable.", 502);
    return { data: bytes, storageKey: `cloudinary:${payload.public_id}`, mimeType };
  }

  const s3 = s3Config();
  if (s3) {
    const key = `students/${userId}/${Date.now()}-${fileName.replace(/[^\w.\-]+/g, "_")}`;
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: bytes,
        ContentType: mimeType,
      }),
    );
    return { data: null as Buffer | null, storageKey: `s3:${key}`, mimeType };
  }

  return { data: bytes, storageKey: null as string | null, mimeType };
}

export async function readStored(file: { data: Uint8Array | Buffer | null; storageKey: string | null; mimeType: string }) {
  if (file.data) return Buffer.from(file.data);
  if (file.storageKey?.startsWith("s3:")) {
    const s3 = s3Config();
    if (!s3) throw new AppError("File storage is not configured.", 500);
    const key = file.storageKey.slice(3);
    const result = await s3.client.send(new GetObjectCommand({ Bucket: s3.bucket, Key: key }));
    const body = await result.Body?.transformToByteArray();
    if (!body) throw new AppError("File not found.", 404);
    return Buffer.from(body);
  }
  if (file.storageKey?.startsWith("cloudinary:")) {
    const cloudinary = cloudinaryConfig();
    if (!cloudinary) throw new AppError("File storage is not configured.", 500);
    const publicId = file.storageKey.slice("cloudinary:".length);
    const response = await fetch(
      `https://res.cloudinary.com/${cloudinary.cloud}/image/upload/${publicId}`,
    );
    if (!response.ok) throw new AppError("File not found.", 404);
    return Buffer.from(await response.arrayBuffer());
  }
  throw new AppError("File not found.", 404);
}
