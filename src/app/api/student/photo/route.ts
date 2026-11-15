import { api, ok } from "@/server/http";
import { AppError } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { getPrisma } from "@/server/db";
import { storeBytes, validatePhoto } from "@/server/files";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) throw new AppError("Choose a photograph.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = validatePhoto(bytes, file.name);
  const stored = await storeBytes(student.id, file.name, mimeType, bytes);
  const prisma = await getPrisma();
  const record = await prisma.storedFile.create({
    data: {
      userId: student.id,
      kind: "photo",
      fileName: file.name,
      mimeType,
      sizeBytes: bytes.length,
      data: stored.data ? new Uint8Array(stored.data) : null,
      storageKey: stored.storageKey,
    },
  });
  await prisma.studentProfile.update({ where: { userId: student.id }, data: { photoFileId: record.id } });
  return ok({ message: "Photograph saved." });
});
