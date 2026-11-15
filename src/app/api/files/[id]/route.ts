import { NextResponse } from "next/server";
import { bootstrap } from "@/server/bootstrap";
import { auth } from "@/auth";
import { getPrisma } from "@/server/db";
import { readStored } from "@/server/files";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await bootstrap();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { id } = await ctx.params;
  const prisma = await getPrisma();
  const file = await prisma.storedFile.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "File not found." }, { status: 404 });
  if (session.user.role !== "ADMIN" && file.userId !== session.user.id) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
  const bytes = await readStored(file);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `${file.kind === "photo" ? "inline" : "attachment"}; filename="${file.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
