import { JsonForm } from "@/components/json-form";
import { formatDateTime } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function AdminNotificationsPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const notes = await prisma.notification.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 40 });
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="surface p-5">
        <h1 className="text-4xl">Send a notice</h1>
        <div className="mt-4">
          <JsonForm url="/api/admin/broadcast" button="Send">
            <label className="field">Audience
              <select name="audience">
                <option value="ALL">All students</option>
                <option value="IT">IT enrollments</option>
                <option value="NON_IT">Non-IT enrollments</option>
                <option value="COMBINED">Combined enrollments</option>
              </select>
            </label>
            <label className="field">Title<input name="title" required /></label>
            <label className="field">Message<textarea name="body" rows={4} required /></label>
          </JsonForm>
        </div>
      </section>
      <section>
        <h2 className="text-3xl">Recent</h2>
        <div className="mt-4 grid gap-3">
          {notes.map((note) => (
            <article key={note.id} className="surface p-4 text-sm">
              <p className="text-muted">{formatDateTime(note.createdAt)} · {note.user.name} · email {note.emailStatus}</p>
              <p className="font-semibold">{note.title}</p>
              <p className="text-muted">{note.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
