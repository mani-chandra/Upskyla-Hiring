import { redirect } from "next/navigation";
import { JsonForm } from "@/components/json-form";
import { getPrisma } from "@/server/db";

export default async function SetupPage() {
  const prisma = await getPrisma();
  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  if (admins > 0) redirect("/login");
  return (
    <main className="container grid place-items-center py-16">
      <div className="surface w-full max-w-md p-8">
        <p className="eyebrow">First administrator</p>
        <h1 className="mt-2 text-4xl">Set up Upskyla</h1>
        <p className="mt-2 text-sm leading-6 text-muted">This page is available only until the first administrator exists. It does not ship with a default password.</p>
        <div className="mt-6">
          <JsonForm url="/api/setup" button="Create administrator" redirect="/login">
            <label className="field">Name<input name="name" required /></label>
            <label className="field">Email<input name="email" type="email" required /></label>
            <label className="field">Password<input name="password" type="password" required /></label>
          </JsonForm>
        </div>
      </div>
    </main>
  );
}
