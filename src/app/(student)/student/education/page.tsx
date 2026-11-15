import { JsonForm } from "@/components/json-form";
import { currentStudent } from "@/server/current";

export default async function EducationPage() {
  const student = await currentStudent();
  const education = student.education;
  return (
    <section className="surface max-w-2xl p-6">
      <h1 className="text-4xl">My education</h1>
      <div className="mt-6">
        <JsonForm url="/api/student/education" button="Save education">
          <label className="field">College<input name="college" defaultValue={education?.college ?? ""} required /></label>
          <label className="field">Degree<input name="degree" defaultValue={education?.degree ?? ""} required /></label>
          <label className="field">Branch<input name="branch" defaultValue={education?.branch ?? ""} required /></label>
          <label className="field">Graduation year<input name="graduationYear" type="number" defaultValue={education?.graduationYear ?? ""} required /></label>
          <label className="field">Academic details<textarea name="academicDetails" rows={4} defaultValue={education?.academicDetails ?? ""} /></label>
        </JsonForm>
      </div>
    </section>
  );
}
