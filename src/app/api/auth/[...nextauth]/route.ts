import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { bootstrap } from "@/server/bootstrap";

export async function GET(req: NextRequest) {
  await bootstrap();
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  await bootstrap();
  return handlers.POST(req);
}
