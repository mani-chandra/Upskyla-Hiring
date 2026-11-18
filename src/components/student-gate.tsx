import Link from "next/link";
import { Button } from "@/components/ui";
import type { StudentBundle } from "@/server/profile";
import { activeEnrollment, dashboardUnlocked, nextOnboardingStep } from "@/server/profile";

export function StudentFeatureGate({
  student,
  title,
  children,
}: {
  student: StudentBundle;
  title: string;
  children: React.ReactNode;
}) {
  if (dashboardUnlocked(student)) return <>{children}</>;
  const enrolled = Boolean(activeEnrollment(student));
  const next = nextOnboardingStep(student);
  return (
    <section className="surface mx-auto max-w-xl p-8 text-center">
      <p className="eyebrow">Locked</p>
      <h1 className="mt-2 text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        {!enrolled
          ? "Buy a course first. Jobs, applications and interviews open after payment and a finished profile."
          : "Finish the profile checklist before this area opens. Course, personal details, photo, education, resume and skills all live under Profile."}
      </p>
      <Button asChild className="mt-6">
        <Link href={next?.href ?? "/student/profile"}>{!enrolled ? "Choose a course" : `Continue: ${next?.label ?? "Profile"}`}</Link>
      </Button>
    </section>
  );
}
