import { CourseCategory, EmploymentType, JobCategory, LanguageProficiency } from "@/generated/prisma/client";
import { asArray, asNumber } from "@/server/parse";
import type { JobInput } from "@/server/jobs";

export function jobInput(body: Record<string, unknown>): JobInput {
  const languageIds = asArray(body.languageIds);
  return {
    companyId: String(body.companyId ?? ""),
    title: String(body.title ?? ""),
    category: String(body.category ?? "IT") === "NON_IT" ? JobCategory.NON_IT : JobCategory.IT,
    description: String(body.description ?? ""),
    responsibilities: String(body.responsibilities ?? ""),
    qualification: String(body.qualification ?? ""),
    experience: String(body.experience ?? ""),
    salaryText: String(body.salaryText ?? ""),
    salaryMin: asNumber(body.salaryMin),
    salaryMax: asNumber(body.salaryMax),
    location: String(body.location ?? ""),
    employmentType: (["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"].includes(String(body.employmentType))
      ? String(body.employmentType)
      : "FULL_TIME") as EmploymentType,
    vacancies: Number(body.vacancies ?? 1),
    applicationDeadline: String(body.applicationDeadline ?? ""),
    skillIds: asArray(body.skillIds),
    verifiedSkillIds: asArray(body.verifiedSkillIds),
    languages: languageIds.map((languageId) => {
      const level = String(body[`lang-${languageId}`] ?? "PROFESSIONAL");
      const minProficiency = (["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT"].includes(level) ? level : "PROFESSIONAL") as LanguageProficiency;
      return { languageId, minProficiency };
    }),
    courseCategories: asArray(body.courseCategories).filter((item): item is CourseCategory =>
      item === "IT" || item === "NON_IT" || item === "COMBINED",
    ),
    minAssessmentScore: asNumber(body.minAssessmentScore),
    graduationYearMin: asNumber(body.graduationYearMin),
    graduationYearMax: asNumber(body.graduationYearMax),
    degreeKeyword: String(body.degreeKeyword ?? ""),
    locationKeyword: String(body.locationKeyword ?? ""),
  };
}
