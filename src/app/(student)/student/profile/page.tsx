import { JsonForm } from "@/components/json-form";
import { UploadForm } from "@/components/student-actions";
import { dateInputValue } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function ProfilePage() {
  const student = await currentStudent();
  const profile = student.profile;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface p-6">
        <h1 className="text-4xl">My profile</h1>
        <p className="mt-2 text-sm text-muted">These details are shared with a company only after you consent on an application and Upskyla forwards you.</p>
        <div className="mt-6">
          <JsonForm url="/api/student/profile" button="Save personal details">
            <label className="field">Full name<input name="name" defaultValue={student.name} required /></label>
            <label className="field">Date of birth<input name="dateOfBirth" type="date" defaultValue={dateInputValue(profile?.dateOfBirth)} required /></label>
            <label className="field">Address<textarea name="address" rows={3} defaultValue={profile?.address ?? ""} required /></label>
            <label className="field">Current location<input name="currentLocation" defaultValue={profile?.currentLocation ?? ""} required /></label>
          </JsonForm>
        </div>
      </section>
      <section className="surface p-6">
        <h2 className="text-3xl">Photograph</h2>
        {profile?.photoFileId ? <img src={`/api/files/${profile.photoFileId}`} alt="" className="mt-4 h-28 w-28 rounded-2xl object-cover" /> : <p className="mt-3 text-sm text-muted">No photograph yet.</p>}
        <div className="mt-4"><UploadForm url="/api/student/photo" accept="image/png,image/jpeg" label="JPG or PNG, under 2 MB" field="photo" /></div>
        <p className="mt-6 text-sm text-muted">Email {student.email} · Phone {student.phone}</p>
      </section>
    </div>
  );
}
