import { PayButton } from "@/components/student-actions";
import { Badge } from "@/components/ui";
import { inr } from "@/lib/format";
import { listCourses } from "@/server/catalog";
import { currentStudent } from "@/server/current";
import { activeEnrollment } from "@/server/profile";

export default async function CoursePage() {
  const student = await currentStudent();
  const courses = await listCourses();
  const enrollment = activeEnrollment(student);
  const pending = student.enrollments.find((item) => item.status === "PENDING_PAYMENT");
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-4xl">My course</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">IT opens technology roles. Non-IT opens the other track. Combined opens both. You can hold one active enrollment.</p>
      </div>
      {enrollment ? (
        <article className="surface p-6">
          <Badge tone="teal">Active</Badge>
          <h2 className="mt-3 text-3xl">{enrollment.course.name}</h2>
          <p className="mt-2 text-sm text-muted">{enrollment.course.description}</p>
        </article>
      ) : (
        courses.map((course) => (
          <article key={course.slug} className="surface p-6">
            <h2 className="text-3xl">{course.name}</h2>
            <p className="mt-2 text-sm text-muted">{course.description}</p>
            <p className="mt-4 text-sm text-muted line-through">{inr(course.originalPrice)}</p>
            <p className="text-3xl">{inr(course.offerPrice)}</p>
            <div className="mt-4 max-w-md">
              {pending?.course.slug === course.slug ? <p className="mb-3 text-sm text-amber">Payment is still pending for this course.</p> : null}
              <PayButton courseId={course.id} />
            </div>
          </article>
        ))
      )}
    </div>
  );
}
