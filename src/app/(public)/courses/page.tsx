import type { Metadata } from "next";
import { CourseGrid, PageIntro } from "@/components/marketing";
import { Reveal } from "@/components/site/motion";
import { listCourses } from "@/server/catalog";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await listCourses();
  return (
    <main>
      <PageIntro
        eyebrow="Courses"
        title="Three preparation tracks. Your course decides which jobs you can open."
        lede="IT students can apply for IT roles. Non-IT students can apply for Non-IT roles. The combined course includes both. Enrollment becomes active only after the payment is verified on the server."
        imageSrc="/images/hero-graduate-desk.jpg"
        imageAlt="Student preparing with Upskyla courses"
      />
      <div className="container py-16">
        <CourseGrid courses={courses} />
        <Reveal>
          <div className="mt-12 surface p-6 sm:p-8">
            <h2 className="text-3xl">What every enrollment includes</h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-muted md:grid-cols-2">
              <p>A student portal with completion progress, assessments, eligible jobs, applications, interviews and notifications.</p>
              <p>A private resume and photo, stored outside the public site and opened only by you or an administrator.</p>
              <p>Communication, teamwork, problem-solving and customer-handling ratings for every course. Technical self-assessment for IT and combined.</p>
              <p>Original and current offer prices from the catalog, so a new batch offer can change without rewriting the page.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
