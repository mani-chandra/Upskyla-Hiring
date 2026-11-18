import { AppShell, type NavItem } from "@/components/shell";
import { currentStudent } from "@/server/current";
import { activeEnrollment, dashboardUnlocked } from "@/server/profile";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await currentStudent();
  const enrolled = Boolean(activeEnrollment(student));
  const unlocked = dashboardUnlocked(student);
  const lockHint = !enrolled
    ? "Choose a course first"
    : "Finish your profile to unlock this";

  const items: NavItem[] = [
    { href: "/student", label: "Home" },
    { href: "/student/profile", label: "Profile" },
    { href: "/student/jobs", label: "Jobs", locked: !unlocked, lockHint },
    { href: "/student/applications", label: "Applications", locked: !unlocked, lockHint },
    { href: "/student/interviews", label: "Interviews", locked: !unlocked, lockHint },
    { href: "/student/notifications", label: "Notifications" },
    { href: "/student/payments", label: "Payments" },
    { href: "/student/settings", label: "Settings" },
  ];

  return (
    <AppShell title="STUDENT" name={student.name} items={items}>
      {children}
    </AppShell>
  );
}
