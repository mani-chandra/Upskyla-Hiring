import "server-only";
import {
  CourseCategory,
  JobCategory,
  LanguageProficiency,
  type Prisma,
} from "@/generated/prisma/client";
import { getPrisma } from "@/server/db";
import { profileReady, type StudentBundle } from "@/server/profile";

const languageRank: Record<LanguageProficiency, number> = {
  BASIC: 1,
  CONVERSATIONAL: 2,
  PROFESSIONAL: 3,
  FLUENT: 4,
};

export type JobMatch = Prisma.JobDescriptionGetPayload<{
  include: {
    company: true;
    requirements: { include: { skill: true } };
    languages: { include: { language: true } };
    eligibility: true;
  };
}>;

export function courseCanSeeCategory(course: CourseCategory, category: JobCategory) {
  if (category === JobCategory.IT) return course === CourseCategory.IT || course === CourseCategory.COMBINED;
  return course === CourseCategory.NON_IT || course === CourseCategory.COMBINED;
}

export function defaultCourseEligibility(category: JobCategory): CourseCategory[] {
  return category === JobCategory.IT
    ? [CourseCategory.IT, CourseCategory.COMBINED]
    : [CourseCategory.NON_IT, CourseCategory.COMBINED];
}

type Person = {
  course: CourseCategory;
  graduationYear?: number | null;
  degree?: string | null;
  branch?: string | null;
  location?: string | null;
  skillIds: Set<string>;
  verifiedSkillIds: Set<string>;
  languages: Map<string, LanguageProficiency>;
  bestScore: number | null;
  profileComplete: boolean;
};

function bestScore(attempts: { score: number; maxScore: number }[]) {
  const scored = attempts.filter((item) => item.maxScore > 0);
  if (scored.length === 0) return null;
  return Math.max(...scored.map((item) => Math.round((item.score / item.maxScore) * 100)));
}

export function personFromStudent(student: StudentBundle): Person | null {
  const enrollment = student.enrollments.find((item) => item.status === "ACTIVE");
  if (!enrollment) return null;
  return {
    course: enrollment.course.category,
    graduationYear: student.education?.graduationYear,
    degree: student.education?.degree,
    branch: student.education?.branch,
    location: student.profile?.currentLocation,
    skillIds: new Set(student.skills.map((item) => item.skillId)),
    verifiedSkillIds: new Set(student.verifiedSkills.map((item) => item.skillId)),
    languages: new Map(student.languages.map((item) => [item.languageId, item.proficiency])),
    bestScore: bestScore(student.attempts),
    profileComplete: profileReady(student),
  };
}

export function eligibilityIssues(person: Person, job: JobMatch, options?: { forApply?: boolean }) {
  const issues: string[] = [];
  const allowed = job.eligibility?.courseCategories?.length
    ? job.eligibility.courseCategories
    : defaultCourseEligibility(job.category);
  if (!courseCanSeeCategory(person.course, job.category) || !allowed.includes(person.course)) {
    issues.push("Your enrolled course does not include this role.");
  }
  if (job.status !== "PUBLISHED") issues.push("This vacancy is not open.");
  if (job.applicationDeadline.getTime() < Date.now()) issues.push("The application deadline has passed.");
  const rules = job.eligibility;
  if (rules?.graduationYearMin && (!person.graduationYear || person.graduationYear < rules.graduationYearMin)) {
    issues.push(`Graduation year must be ${rules.graduationYearMin} or later.`);
  }
  if (rules?.graduationYearMax && (!person.graduationYear || person.graduationYear > rules.graduationYearMax)) {
    issues.push(`Graduation year must be ${rules.graduationYearMax} or earlier.`);
  }
  if (rules?.degreeKeyword) {
    const haystack = `${person.degree ?? ""} ${person.branch ?? ""}`.toLowerCase();
    if (!haystack.includes(rules.degreeKeyword.toLowerCase())) {
      issues.push(`This role asks for a qualification matching “${rules.degreeKeyword}”.`);
    }
  }
  if (rules?.locationKeyword) {
    if (!person.location?.toLowerCase().includes(rules.locationKeyword.toLowerCase())) {
      issues.push(`This role is limited to candidates in ${rules.locationKeyword}.`);
    }
  }
  if (rules?.minAssessmentScore != null) {
    if (person.bestScore == null || person.bestScore < rules.minAssessmentScore) {
      issues.push(`A minimum assessment score of ${rules.minAssessmentScore}% is required.`);
    }
  }
  for (const requirement of job.requirements.filter((item) => item.required)) {
    const has = requirement.requiresVerification
      ? person.verifiedSkillIds.has(requirement.skillId)
      : person.skillIds.has(requirement.skillId) || person.verifiedSkillIds.has(requirement.skillId);
    if (!has) {
      issues.push(
        requirement.requiresVerification
          ? `${requirement.skill.name} must be a verified skill.`
          : `${requirement.skill.name} is required.`,
      );
    }
  }
  for (const requirement of job.languages) {
    const current = person.languages.get(requirement.languageId);
    if (!current || languageRank[current] < languageRank[requirement.minProficiency]) {
      issues.push(`${requirement.language.name} at ${requirement.minProficiency.toLowerCase()} level or higher is required.`);
    }
  }
  if (options?.forApply && !person.profileComplete) {
    issues.push("Finish your profile, education, skills and resume before applying.");
  }
  return issues;
}

const jobInclude = {
  company: true,
  requirements: { include: { skill: true } },
  languages: { include: { language: true } },
  eligibility: true,
} satisfies Prisma.JobDescriptionInclude;

export async function getVisibleJobs(student: StudentBundle) {
  const enrollment = student.enrollments.find((item) => item.status === "ACTIVE");
  if (!enrollment) return [];
  const prisma = await getPrisma();
  const jobs = await prisma.jobDescription.findMany({
    where: { status: "PUBLISHED" },
    include: jobInclude,
    orderBy: { publishedAt: "desc" },
  });
  return jobs.filter((job) => courseCanSeeCategory(enrollment.course.category, job.category));
}

export async function countMatches(job: JobMatch) {
  const ids = await matchingStudents(job);
  return ids.length;
}

export async function matchingStudents(job: JobMatch) {
  const prisma = await getPrisma();
  const allowed = job.eligibility?.courseCategories?.length
    ? job.eligibility.courseCategories
    : defaultCourseEligibility(job.category);
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE", course: { category: { in: allowed } } },
    select: { userId: true },
  });
  const matches: string[] = [];
  for (const enrollment of enrollments) {
    const { getStudentBundle } = await import("@/server/profile");
    const student = await getStudentBundle(enrollment.userId);
    if (!student) continue;
    const person = personFromStudent(student);
    if (!person) continue;
    if (eligibilityIssues(person, job).length === 0) matches.push(student.id);
  }
  return matches;
}
