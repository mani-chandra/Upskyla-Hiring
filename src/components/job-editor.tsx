import { JsonForm } from "@/components/json-form";
import { dateInputValue } from "@/lib/format";

type Company = { id: string; name: string };
type Skill = { id: string; name: string };
type Language = { id: string; name: string };
type Job = {
  id: string;
  companyId: string;
  title: string;
  category: string;
  description: string;
  responsibilities: string;
  qualification: string;
  experience: string;
  salaryText: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string;
  employmentType: string;
  vacancies: number;
  applicationDeadline: Date;
  requirements: { skillId: string; requiresVerification: boolean }[];
  languages: { languageId: string; minProficiency: string }[];
  eligibility: {
    courseCategories: string[];
    minAssessmentScore: number | null;
    graduationYearMin: number | null;
    graduationYearMax: number | null;
    degreeKeyword: string | null;
    locationKeyword: string | null;
  } | null;
} | null;

export function JobEditor({
  companies,
  skills,
  languages,
  job,
}: {
  companies: Company[];
  skills: Skill[];
  languages: Language[];
  job: Job;
}) {
  const selected = new Set(job?.requirements.map((item) => item.skillId) ?? []);
  const verified = new Set(job?.requirements.filter((item) => item.requiresVerification).map((item) => item.skillId) ?? []);
  const languageMap = new Map(job?.languages.map((item) => [item.languageId, item.minProficiency]) ?? []);
  return (
    <JsonForm url={job ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs"} method={job ? "PUT" : "POST"} button={job ? "Save job description" : "Save draft"} redirect="/admin/jobs">
      <label className="field">Company
        <select name="companyId" defaultValue={job?.companyId ?? ""} required>
          <option value="">Select</option>
          {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
        </select>
      </label>
      <label className="field">Job title<input name="title" defaultValue={job?.title ?? ""} required /></label>
      <label className="field">Category
        <select name="category" defaultValue={job?.category ?? "IT"}>
          <option value="IT">IT</option>
          <option value="NON_IT">Non-IT</option>
        </select>
      </label>
      <label className="field">Description<textarea name="description" rows={4} defaultValue={job?.description ?? ""} required /></label>
      <label className="field">Responsibilities<textarea name="responsibilities" rows={4} defaultValue={job?.responsibilities ?? ""} required /></label>
      <label className="field">Qualification<input name="qualification" defaultValue={job?.qualification ?? ""} required /></label>
      <label className="field">Experience<input name="experience" defaultValue={job?.experience ?? ""} required /></label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="field">Salary text<input name="salaryText" defaultValue={job?.salaryText ?? ""} required /></label>
        <label className="field">Location<input name="location" defaultValue={job?.location ?? ""} required /></label>
        <label className="field">Minimum salary (₹)<input name="salaryMin" type="number" defaultValue={job?.salaryMin ?? ""} /></label>
        <label className="field">Maximum salary (₹)<input name="salaryMax" type="number" defaultValue={job?.salaryMax ?? ""} /></label>
      </div>
      <label className="field">Employment type
        <select name="employmentType" defaultValue={job?.employmentType ?? "FULL_TIME"}>
          {["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <label className="field">Vacancies<input name="vacancies" type="number" defaultValue={job?.vacancies ?? 1} required /></label>
      <label className="field">Application deadline<input name="applicationDeadline" type="date" defaultValue={job ? dateInputValue(job.applicationDeadline) : ""} required /></label>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Course eligibility</legend>
        {["IT", "NON_IT", "COMBINED"].map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm font-normal">
            <input className="w-auto" type="checkbox" name="courseCategories" value={category} defaultChecked={job?.eligibility?.courseCategories.includes(category) ?? (category !== "NON_IT")} />
            {category === "NON_IT" ? "Non-IT" : category === "IT" ? "IT" : "Combined"}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="field">Minimum assessment score<input name="minAssessmentScore" type="number" defaultValue={job?.eligibility?.minAssessmentScore ?? ""} /></label>
        <label className="field">Degree keyword<input name="degreeKeyword" defaultValue={job?.eligibility?.degreeKeyword ?? ""} /></label>
        <label className="field">Graduation year from<input name="graduationYearMin" type="number" defaultValue={job?.eligibility?.graduationYearMin ?? ""} /></label>
        <label className="field">Graduation year to<input name="graduationYearMax" type="number" defaultValue={job?.eligibility?.graduationYearMax ?? ""} /></label>
        <label className="field">Location keyword<input name="locationKeyword" defaultValue={job?.eligibility?.locationKeyword ?? ""} /></label>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Required skills</legend>
        {skills.map((skill) => (
          <div key={skill.id} className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2 font-normal"><input className="w-auto" type="checkbox" name="skillIds" value={skill.id} defaultChecked={selected.has(skill.id)} />{skill.name}</label>
            <label className="flex items-center gap-2 font-normal text-muted"><input className="w-auto" type="checkbox" name="verifiedSkillIds" value={skill.id} defaultChecked={verified.has(skill.id)} />Require verification</label>
          </div>
        ))}
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold">Required languages</legend>
        {languages.map((language) => (
          <div key={language.id} className="grid gap-2 md:grid-cols-[1fr_180px]">
            <label className="flex items-center gap-2 text-sm font-normal"><input className="w-auto" type="checkbox" name="languageIds" value={language.id} defaultChecked={languageMap.has(language.id)} />{language.name}</label>
            <select name={`lang-${language.id}`} defaultValue={languageMap.get(language.id) ?? "PROFESSIONAL"}>
              {["BASIC", "CONVERSATIONAL", "PROFESSIONAL", "FLUENT"].map((level) => <option key={level}>{level}</option>)}
            </select>
          </div>
        ))}
      </fieldset>
    </JsonForm>
  );
}
