import { api, ok } from "@/server/http";
import { readJson } from "@/server/errors";
import { requireStudent } from "@/server/guards";
import { verifyCheckout } from "@/server/payments";

export const POST = api(async (req) => {
  await requireStudent();
  const body = await readJson<{ orderId: string; paymentId: string; signature: string }>(req);
  await verifyCheckout(body);
  return ok();
});
