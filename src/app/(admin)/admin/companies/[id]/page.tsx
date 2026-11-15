import { notFound } from "next/navigation";
import { JsonForm } from "@/components/json-form";
import { currentAdmin } from "@/server/current";
import { getPrisma } from "@/server/db";

export default async function CompanyEdit({ params }: { params: Promise<{ id: string }> }) {
  await currentAdmin();
  const { id } = await params;
  const prisma = await getPrisma();
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();
  return (
    <section className="surface max-w-2xl p-6">
      <h1 className="text-4xl">{company.name}</h1>
      {company.isSample ? <p className="mt-2 text-sm text-amber">Sample record. Not a public partnership claim.</p> : null}
      <div className="mt-6">
        <JsonForm url={`/api/admin/companies/${company.id}`} method="PUT" button="Save company">
          <label className="field">Name<input name="name" defaultValue={company.name} required /></label>
          <label className="field">Industry<input name="industry" defaultValue={company.industry} required /></label>
          <label className="field">Website<input name="website" defaultValue={company.website ?? ""} /></label>
          <label className="field">Location<input name="location" defaultValue={company.location} required /></label>
          <label className="field">HR name<input name="hrName" defaultValue={company.hrName} required /></label>
          <label className="field">HR email<input name="hrEmail" defaultValue={company.hrEmail} required /></label>
          <label className="field">HR phone<input name="hrPhone" defaultValue={company.hrPhone} required /></label>
          <label className="field">Partnership
            <select name="partnershipStatus" defaultValue={company.partnershipStatus}>
              {["PROSPECT", "ACTIVE", "PAUSED", "ENDED"].map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label className="field">Internal notes<textarea name="internalNotes" rows={4} defaultValue={company.internalNotes ?? ""} /></label>
        </JsonForm>
      </div>
    </section>
  );
}
