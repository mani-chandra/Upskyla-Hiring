import { getPrisma } from "@/server/db";
import type { CourseCard } from "@/components/marketing";

export async function listCourses(): Promise<CourseCard[]> {
  const prisma = await getPrisma();
  const courses = await prisma.course.findMany({
    where: { active: true },
    include: { pricing: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });
  const order = ["it", "non-it", "combined"];
  return courses
    .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
    .map((course) => ({
      id: course.id,
      slug: course.slug,
      name: course.name,
      summary: course.summary,
      description: course.description,
      originalPrice: course.pricing[0]?.originalPrice ?? 0,
      offerPrice: course.pricing[0]?.offerPrice ?? 0,
      label: course.pricing[0]?.label ?? "Current fee",
    }));
}
