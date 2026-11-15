import { notFound } from "next/navigation";
import { AssessmentForm } from "@/components/student-actions";
import { currentStudent } from "@/server/current";
import { activeEnrollment } from "@/server/profile";
import { getPrisma } from "@/server/db";

export default async function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await currentStudent();
  const enrollment = activeEnrollment(student);
  const prisma = await getPrisma();
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: { orderBy: { sortOrder: "asc" }, include: { options: { orderBy: { sortOrder: "asc" }, select: { id: true, text: true } } } } },
  });
  if (!assessment || !enrollment || !assessment.appliesTo.includes(enrollment.course.category)) notFound();
  return (
    <div>
      <h1 className="text-4xl">{assessment.title}</h1>
      <p className="mt-2 mb-6 text-sm text-muted">{assessment.summary}</p>
      <AssessmentForm assessmentId={assessment.id} questions={assessment.questions} />
    </div>
  );
}
