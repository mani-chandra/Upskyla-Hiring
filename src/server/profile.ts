import "server-only";
import { CourseCategory, SoftSkillLevel } from "@/generated/prisma/client";
import { getPrisma } from "@/server/db";

const softLevels = new Set<string>(Object.values(SoftSkillLevel));

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  const ten =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return `+91${ten}`;
}

export function assertAdult(date: Date) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return date <= cutoff;
}

export function isSoftLevel(value: string): value is SoftSkillLevel {
  return softLevels.has(value);
}

export async function getStudentBundle(userId: string) {
  const prisma = await getPrisma();
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      education: true,
      resumes: {
        where: { isCurrent: true },
        include: {
          file: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true } },
        },
      },
      enrollments: {
        include: {
          course: {
            include: {
              pricing: { where: { active: true }, orderBy: { effectiveFrom: "desc" }, take: 1 },
            },
          },
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      skills: { include: { skill: true } },
      languages: { include: { language: true } },
      verifiedSkills: { include: { skill: true } },
      attempts: { include: { assessment: true }, orderBy: { submittedAt: "desc" } },
      applications: {
        include: {
          job: { include: { company: { select: { id: true, name: true, isSample: true } } } },
          interviews: { select: { id: true, type: true, scheduledAt: true, meetingLink: true, status: true } },
          outcome: { select: { outcome: true, notes: true, recordedAt: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      notifications: { orderBy: { createdAt: "desc" }, take: 30 },
      notificationPreference: true,
    },
  });
}

export type StudentBundle = NonNullable<Awaited<ReturnType<typeof getStudentBundle>>>;

export function activeEnrollment(student: StudentBundle) {
  return student.enrollments.find((item) => item.status === "ACTIVE") ?? null;
}

export function profileChecks(student: StudentBundle) {
  const profile = student.profile;
  const education = student.education;
  const checks = [
    { label: "Name, email and phone", done: Boolean(student.name && student.email && student.phone) },
    { label: "Email verified", done: Boolean(student.emailVerified) },
    { label: "Phone verified", done: Boolean(student.phoneVerified) },
    { label: "Active course", done: Boolean(activeEnrollment(student)) },
    { label: "Date of birth", done: Boolean(profile?.dateOfBirth) },
    { label: "Address and location", done: Boolean(profile?.address && profile.currentLocation) },
    { label: "Photograph", done: Boolean(profile?.photoFileId) },
    { label: "Education", done: Boolean(education?.college && education.degree && education.branch && education.graduationYear) },
    { label: "Resume", done: student.resumes.length > 0 },
    {
      label: "Languages and workplace skills",
      done: Boolean(
        student.languages.length > 0 &&
          profile?.communicationSkill &&
          profile.teamworkSkill &&
          profile.problemSolvingSkill &&
          profile.customerHandlingSkill,
      ),
    },
  ];
  const course = activeEnrollment(student)?.course.category;
  if (course === CourseCategory.IT || course === CourseCategory.COMBINED) {
    checks.push({ label: "Technical self-assessment", done: student.skills.length > 0 });
  }
  const done = checks.filter((item) => item.done).length;
  return { checks, percent: Math.round((done / checks.length) * 100) };
}

export function profileReady(student: StudentBundle) {
  const { checks } = profileChecks(student);
  return checks.every((item) => item.done);
}

export async function maybeNotifyOnboarding(userId: string) {
  const student = await getStudentBundle(userId);
  if (!student || !profileReady(student)) return;
  const prisma = await getPrisma();
  const existing = await prisma.notification.findFirst({ where: { userId, type: "onboarding_complete" } });
  if (existing) return;
  const { notify } = await import("@/server/notifications");
  await notify({
    userId,
    type: "onboarding_complete",
    title: "Profile ready",
    body: "Your profile, education, skills and resume are in place. You can apply for roles your course allows.",
  });
}
