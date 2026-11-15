import Link from "next/link";
import { JsonForm } from "@/components/json-form";
import { titleCase } from "@/lib/format";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function CompaniesPage() {
  await currentAdmin();
  const prisma = await getPrisma();
  const companies = await prisma.company.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div>
        <h1 className="text-4xl">Companies</h1>
        <p className="mt-2 text-sm text-muted">Sample records are marked. They are not shown as real partners on the public site.</p>
        <div className="mt-4 table-wrap surface">
          <table className="data">
            <thead><tr><th>Company</th><th>Status</th><th>Location</th></tr></thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td><Link className="font-semibold text-electric" href={`/admin/companies/${company.id}`}>{company.name}</Link></td>
                  <td>{titleCase(company.partnershipStatus)}</td>
                  <td>{company.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <section className="surface p-5">
        <h2 className="text-2xl">New company</h2>
        <div className="mt-4">
          <JsonForm url="/api/admin/companies" button="Create company" redirect="/admin/companies">
            <label className="field">Name<input name="name" required /></label>
            <label className="field">Industry<input name="industry" required /></label>
            <label className="field">Website<input name="website" /></label>
            <label className="field">Location<input name="location" required /></label>
            <label className="field">HR name<input name="hrName" required /></label>
            <label className="field">HR email<input name="hrEmail" type="email" required /></label>
            <label className="field">HR phone<input name="hrPhone" required /></label>
            <label className="field">Partnership
              <select name="partnershipStatus" defaultValue="PROSPECT">
                {["PROSPECT", "ACTIVE", "PAUSED", "ENDED"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="field">Internal notes<textarea name="internalNotes" rows={3} /></label>
          </JsonForm>
        </div>
      </section>
    </div>
  );
}
