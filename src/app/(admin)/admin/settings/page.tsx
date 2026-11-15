import { integrationStatus } from "@/server/notifications";
import { currentAdmin } from "@/server/current";

export default async function AdminSettingsPage() {
  await currentAdmin();
  const status = integrationStatus();
  const rows = [
    ["Razorpay", status.razorpay, "Orders, signatures and webhooks"],
    ["Resend", status.resend, "Email verification and notices"],
    ["MSG91", status.msg91, "Phone verification SMS"],
    ["S3 storage", Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID), "Private resume and photo storage"],
    ["Cloudinary", Boolean(process.env.CLOUDINARY_URL), "Optional file copy. Downloads still use the private copy."],
  ];
  return (
    <div>
      <h1 className="text-4xl">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Integrations read their keys from the environment. This page shows whether a key is present. It never shows the value. Without Razorpay, students use a labeled demonstration checkout.</p>
      <div className="mt-6 grid gap-3">
        {rows.map(([label, on, note]) => (
          <article key={String(label)} className="surface flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-muted">{note}</p>
            </div>
            <p className={on ? "text-teal" : "text-amber"}>{on ? "Configured" : "Not configured"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
