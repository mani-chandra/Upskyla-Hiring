import { AppShell } from "@/components/shell";
import { currentAdmin } from "@/server/current";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/enrollments", label: "Enrollments" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/skills", label: "Skills Management" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/jobs", label: "Job Descriptions" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/shortlisting", label: "Shortlisting" },
  { href: "/admin/interviews", label: "Interviews" },
  { href: "/admin/outcomes", label: "Hiring Results" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  return (
    <AppShell title="ADMIN" name={admin.name} items={items}>
      {children}
    </AppShell>
  );
}
