import { JsonForm } from "@/components/json-form";
import { formatDateTime } from "@/lib/format";
import { currentStudent } from "@/server/current";

export default async function NotificationsPage() {
  const student = await currentStudent();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl">Notifications</h1>
        <div className="w-40"><JsonForm url="/api/student/notifications/read" button="Mark read">{null}</JsonForm></div>
      </div>
      <div className="mt-6 grid gap-3">
        {student.notifications.length === 0 ? <p className="surface p-5 text-sm">No notifications yet.</p> : student.notifications.map((notice) => (
          <article key={notice.id} className="surface p-5">
            <p className="text-xs text-muted">{formatDateTime(notice.createdAt)}{notice.readAt ? "" : " · New"}</p>
            <h2 className="mt-1 text-2xl">{notice.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{notice.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
