import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing";
import { JsonForm } from "@/components/json-form";
import { AssistantPanel } from "@/components/site/assistant";
import { Reveal } from "@/components/site/motion";
import { brand, phoneHref } from "@/lib/brand";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Contact Us"
        title="Questions, partnerships, or support — reach Upskyla directly."
        lede="Send a query with the form, call either number below, or chat with the Upskyla assistant for quick answers about courses, eligibility, payments, and the student dashboard."
        imageSrc="/images/section-interview.jpg"
        imageAlt="Conversation with Upskyla"
      />
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div className="grid gap-6">
            <section className="surface p-6">
              <h2 className="text-3xl">Send a query</h2>
              <p className="mt-2 text-sm leading-6 text-muted">An administrator is notified when you submit. We use your details only to respond to this inquiry.</p>
              <div className="mt-5">
                <JsonForm url="/api/contact" button="Send message">
                  <label className="field">Name<input name="name" required /></label>
                  <label className="field">Email<input name="email" type="email" required /></label>
                  <label className="field">Phone (optional)<input name="phone" placeholder="10-digit Indian mobile" /></label>
                  <label className="field">Subject<input name="subject" required /></label>
                  <label className="field">Message<textarea name="message" rows={5} required /></label>
                </JsonForm>
              </div>
            </section>
            <section className="surface p-6">
              <h2 className="text-3xl">Talk to us</h2>
              <div className="mt-4 grid gap-3 text-sm leading-7">
                {brand.phones.map((phone) => (
                  <a key={phone} className="text-electric font-semibold" href={phoneHref(phone)}>{phone}</a>
                ))}
                <a className="text-electric font-semibold" href={brand.websiteUrl}>{brand.websiteLabel}</a>
                <p className="text-muted">For hiring collaboration you can also use For Companies. Students apply to roles from the dashboard after a course and a finished profile.</p>
              </div>
            </section>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div>
            <h2 className="mb-4 text-3xl">Ask the AI assistant</h2>
            <p className="mb-4 text-sm leading-6 text-muted">Get instant answers about Upskyla. For account-specific issues, leave your details in the form as well.</p>
            <AssistantPanel embedded />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
