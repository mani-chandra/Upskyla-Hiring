import { api, ok } from "@/server/http";
import { AppError } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { storeBytes, validateResume } from "@/server/files";
import { maybeNotifyOnboarding } from "@/server/profile";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const form = await req.formData();
  const file = form.get("resume");
  if (!(file instanceof File)) throw new AppError("Choose a resume.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = validateResume(bytes, file.name);
  const stored = await storeBytes(student.id, file.name, mimeType, bytes);
  const prisma = await getPrisma();
  const record = await prisma.storedFile.create({
    data: { userId: student.id, kind: "resume", fileName: file.name, mimeType, sizeBytes: bytes.length, data: stored.data ? new Uint8Array(stored.data) : null, storageKey: stored.storageKey },
  });
  await prisma.studentResume.updateMany({ where: { userId: student.id, isCurrent: true }, data: { isCurrent: false } });
  await prisma.studentResume.create({ data: { userId: student.id, fileId: record.id, isCurrent: true } });
  await maybeNotifyOnboarding(student.id);
  return ok({ message: "Resume uploaded." });
});
