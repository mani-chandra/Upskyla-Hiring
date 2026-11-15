import { JsonForm } from "@/components/json-form";
import { inr } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function AdminCoursesPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const courses = await prisma.course.findMany({ include: { pricing: { where: { active: true }, take: 1, orderBy: { effectiveFrom: "desc" } } } });
  return (
    <div className="grid gap-4">
      <h1 className="text-4xl">Courses</h1>
      <p className="text-sm text-muted">Changing the offer creates a new price row. Existing payments keep the amount that was charged.</p>
      {courses.map((course) => (
        <article key={course.id} className="surface p-5">
          <h2 className="text-2xl">{course.name}</h2>
          <p className="text-sm text-muted">Current offer {inr(course.pricing[0]?.offerPrice ?? 0)} · Original {inr(course.pricing[0]?.originalPrice ?? 0)}</p>
          <div className="mt-4 max-w-md">
            <JsonForm url="/api/admin/pricing" button="Update price">
              <input type="hidden" name="courseId" value={course.id} />
              <label className="field">Original price (₹)<input name="originalPrice" type="number" defaultValue={course.pricing[0]?.originalPrice ?? 0} /></label>
              <label className="field">Offer price (₹)<input name="offerPrice" type="number" defaultValue={course.pricing[0]?.offerPrice ?? 0} /></label>
              <label className="field">Label<input name="label" defaultValue={course.pricing[0]?.label ?? "New Batch Offer"} /></label>
            </JsonForm>
          </div>
        </article>
      ))}
    </div>
  );
}
