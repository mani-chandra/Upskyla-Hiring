import { NextResponse } from "next/server";
import { bootstrap } from "@/server/bootstrap";
import { assertSameOrigin, errorResponse } from "@/server/errors";

type Handler = (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

export function api(handler: Handler, options?: { origin?: boolean }) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    try {
      await bootstrap();
      if (options?.origin !== false && req.method !== "GET") assertSameOrigin(req);
      return await handler(req, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function ok(data: object = { ok: true }, status = 200) {
  return NextResponse.json(data, { status });
}
