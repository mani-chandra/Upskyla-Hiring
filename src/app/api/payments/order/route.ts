import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { createOrder } from "@/server/payments";

export const POST = api(async (req) => {
  const student = await requireStudent();
  const body = await readJson<{ courseId: string }>(req);
  return ok(await createOrder(student.id, body.courseId));
});
