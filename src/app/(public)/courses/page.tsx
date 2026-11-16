import type { Metadata } from "next";
import { CourseGrid, PageIntro } from "@/components/marketing";
import { listCourses } from "@/server/catalog";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await listCourses();
  return (
    <main>
      <PageIntro
        eyebrow="Courses"
        title="Three preparation tracks. Your course decides which jobs you can open."
        lede="IT students can apply for IT roles. Non-IT students can apply for Non-IT roles. The combined course includes both. Enrollment becomes active only after the payment is verified on the server. A checkout screen by itself does not open the job list."
      />
      <div className="container py-16">
        <CourseGrid courses={courses} />
        <div className="mt-12 surface p-6 sm:p-8">
          <h2 className="text-3xl">What every enrollment includes</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-muted md:grid-cols-2">
            <p>A student portal with your completion progress, course, assessment history, verified skills, eligible jobs, applications, interviews and notifications.</p>
            <p>A private resume and photo, stored outside the public site and opened only by you or an administrator. PDF and DOCX are the resume formats accepted.</p>
            <p>Communication, teamwork, problem-solving and customer-handling ratings, plus language proficiency, for every course. Technical self-assessment is added for IT and combined students.</p>
            <p>The original price and the current offer, shown on the card above. Administrators can change a batch price in the catalog. The page reads that price rather than a number typed into the layout.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
