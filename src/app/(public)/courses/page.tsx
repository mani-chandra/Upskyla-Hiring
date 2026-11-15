import type { Metadata } from "next";
import { CourseGrid } from "@/components/marketing";
import { listCourses } from "@/server/catalog";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await listCourses();
  return (
    <main className="container py-16">
      <p className="eyebrow">Courses</p>
      <h1 className="mt-3 max-w-3xl text-5xl">Three preparation tracks. Your course decides which jobs you can open.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">IT students can apply for IT roles. Non-IT students can apply for Non-IT roles. The combined course includes both. Enrollment becomes active only after the payment is verified on the server.</p>
      <div className="mt-10"><CourseGrid courses={courses} /></div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {courses.map((course) => (
          <article key={course.slug} className="text-sm leading-6 text-muted">
            <h2 className="text-2xl text-ink">{course.name}</h2>
            <p className="mt-2">{course.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
