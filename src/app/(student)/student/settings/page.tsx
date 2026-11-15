import { JsonForm } from "@/components/json-form";
import { currentStudent } from "@/server/current";

export default async function SettingsPage() {
  const student = await currentStudent();
  const prefs = student.notificationPreference;
  return (
    <section className="surface max-w-xl p-6">
      <h1 className="text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">In-app notices stay available. Email is sent only when Resend is configured and you leave it on.</p>
      <div className="mt-6">
        <JsonForm url="/api/student/settings" button="Save settings">
          <label className="flex items-center gap-2 text-sm font-normal"><input className="w-auto" type="checkbox" name="emailEnabled" value="true" defaultChecked={prefs?.emailEnabled !== false} /> Email notifications</label>
          <label className="flex items-center gap-2 text-sm font-normal"><input className="w-auto" type="checkbox" name="inAppEnabled" value="true" defaultChecked={prefs?.inAppEnabled !== false} /> In-dashboard notifications</label>
        </JsonForm>
      </div>
    </section>
  );
}
