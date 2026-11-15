import "server-only";
import { CourseCategory, EmploymentType, JobCategory, JobStatus, LanguageProficiency } from "@/generated/prisma/client";
import { AppError } from "@/server/errors";
import { getPrisma } from "@/server/db";
import { countMatches, defaultCourseEligibility, matchingStudents } from "@/server/eligibility";
import { notify } from "@/server/notifications";
import { audit } from "@/server/guards";

export type JobInput = {
  companyId: string;
  title: string;
  category: JobCategory;
  description: string;
  responsibilities: string;
  qualification: string;
  experience: string;
  salaryText: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  location: string;
  employmentType: EmploymentType;
  vacancies: number;
  applicationDeadline: string;
  skillIds: string[];
  verifiedSkillIds: string[];
  languages: { languageId: string; minProficiency: LanguageProficiency }[];
  courseCategories: CourseCategory[];
  minAssessmentScore?: number | null;
  graduationYearMin?: number | null;
  graduationYearMax?: number | null;
  degreeKeyword?: string | null;
  locationKeyword?: string | null;
};

function clean(input: JobInput) {
  if (!input.title.trim() || !input.description.trim() || !input.companyId) {
    throw new AppError("Company, title and description are required.");
  }
  const deadline = new Date(input.applicationDeadline);
  if (Number.isNaN(deadline.getTime())) throw new AppError("Enter a valid application deadline.");
  if (!Number.isInteger(input.vacancies) || input.vacancies < 1) throw new AppError("Vacancies must be at least 1.");
  const allowedDefaults = new Set(defaultCourseEligibility(input.category));
  const courseCategories = (input.courseCategories.length ? input.courseCategories : [...allowedDefaults]).filter((item) =>
    allowedDefaults.has(item),
  );
  if (courseCategories.length === 0) throw new AppError("Choose a course eligibility that matches the job category.");
  return { deadline, courseCategories };
}

async function writeRelations(jobId: string, input: JobInput, courseCategories: CourseCategory[]) {
  const prisma = await getPrisma();
  await prisma.jobRequirement.deleteMany({ where: { jobId } });
  await prisma.jobLanguage.deleteMany({ where: { jobId } });
  const verified = new Set(input.verifiedSkillIds);
  if (input.skillIds.length) {
    await prisma.jobRequirement.createMany({
      data: input.skillIds.map((skillId) => ({
        jobId,
        skillId,
        required: true,
        requiresVerification: verified.has(skillId),
      })),
    });
  }
  if (input.languages.length) {
    await prisma.jobLanguage.createMany({
      data: input.languages.map((item) => ({
        jobId,
        languageId: item.languageId,
        minProficiency: item.minProficiency,
      })),
    });
  }
  await prisma.jobEligibility.upsert({
    where: { jobId },
    create: {
      jobId,
      courseCategories,
      minAssessmentScore: input.minAssessmentScore ?? null,
      graduationYearMin: input.graduationYearMin ?? null,
      graduationYearMax: input.graduationYearMax ?? null,
      degreeKeyword: input.degreeKeyword || null,
      locationKeyword: input.locationKeyword || null,
    },
    update: {
      courseCategories,
      minAssessmentScore: input.minAssessmentScore ?? null,
      graduationYearMin: input.graduationYearMin ?? null,
      graduationYearMax: input.graduationYearMax ?? null,
      degreeKeyword: input.degreeKeyword || null,
      locationKeyword: input.locationKeyword || null,
    },
  });
}

export async function saveJob(actorId: string, input: JobInput, jobId?: string) {
  const prisma = await getPrisma();
  const { deadline, courseCategories } = clean(input);
  const data = {
    companyId: input.companyId,
    title: input.title.trim(),
    category: input.category,
    description: input.description.trim(),
    responsibilities: input.responsibilities.trim(),
    qualification: input.qualification.trim(),
    experience: input.experience.trim(),
    salaryText: input.salaryText.trim(),
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    location: input.location.trim(),
    employmentType: input.employmentType,
    vacancies: input.vacancies,
    applicationDeadline: deadline,
  };
  const job = jobId
    ? await prisma.jobDescription.update({ where: { id: jobId }, data })
    : await prisma.jobDescription.create({ data: { ...data, status: "DRAFT" } });
  await writeRelations(job.id, input, courseCategories);
  await audit(actorId, jobId ? "job.update" : "job.create", "JobDescription", job.id);
  return job;
}

export async function loadJob(id: string) {
  const prisma = await getPrisma();
  const job = await prisma.jobDescription.findUnique({
    where: { id },
    include: {
      company: true,
      requirements: { include: { skill: true } },
      languages: { include: { language: true } },
      eligibility: true,
    },
  });
  if (!job) throw new AppError("Job not found.", 404);
  return job;
}

export async function previewJob(id: string) {
  const job = await loadJob(id);
  return countMatches(job);
}

export async function setJobStatus(actorId: string, id: string, status: JobStatus) {
  const prisma = await getPrisma();
  const job = await loadJob(id);
  if (status === "PUBLISHED") {
    if (job.applicationDeadline.getTime() < Date.now()) throw new AppError("Extend the deadline before publishing.");
    await prisma.jobDescription.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    const matches = await matchingStudents(job);
    for (const userId of matches) {
      await notify({
        userId,
        type: "new_job",
        title: `New role: ${job.title}`,
        body: `${job.company.name} has a ${job.category === "IT" ? "technology" : "non-technology"} opening in ${job.location}. You match the current eligibility rules.`,
      });
    }
    await audit(actorId, "job.publish", "JobDescription", id, { matches: matches.length });
    return { matches: matches.length };
  }
  if (status !== "CLOSED" && status !== "ARCHIVED" && status !== "DRAFT") {
    throw new AppError("Unsupported status.");
  }
  await prisma.jobDescription.update({ where: { id }, data: { status } });
  await audit(actorId, `job.${status.toLowerCase()}`, "JobDescription", id);
  return { matches: 0 };
}
