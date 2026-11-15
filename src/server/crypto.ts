import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomCode(length = 6) {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i += 1) code += digits[randomInt(0, digits.length)];
  return code;
}

export function randomSecret() {
  return randomBytes(32).toString("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function hmacHex(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}
