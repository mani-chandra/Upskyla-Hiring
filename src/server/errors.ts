import { NextResponse } from "next/server";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("request failed");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export async function readJson<T>(req: Request): Promise<T> {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > 200_000) throw new AppError("Request is too large.", 413);
  try {
    return (await req.json()) as T;
  } catch {
    throw new AppError("Request body must be JSON.");
  }
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) throw new AppError("Forbidden.", 403);
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError("Forbidden.", 403);
  }
  if (originHost !== host) throw new AppError("Forbidden.", 403);
}
