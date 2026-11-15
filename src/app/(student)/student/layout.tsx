import { AppShell } from "@/components/shell";
import { currentStudent } from "@/server/current";

const items = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/profile", label: "My Profile" },
  { href: "/student/education", label: "My Education" },
  { href: "/student/resume", label: "My Resume" },
  { href: "/student/course", label: "My Course" },
  { href: "/student/skills", label: "My Skills" },
  { href: "/student/assessments", label: "Assessments" },
  { href: "/student/jobs", label: "Job Opportunities" },
  { href: "/student/applications", label: "My Applications" },
  { href: "/student/interviews", label: "Mock Interviews" },
  { href: "/student/notifications", label: "Notifications" },
  { href: "/student/payments", label: "Payments" },
  { href: "/student/settings", label: "Settings" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await currentStudent();
  return (
    <AppShell title="STUDENT" name={student.name} items={items}>
      {children}
    </AppShell>
  );
}
