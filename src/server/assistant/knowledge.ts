import { brand } from "@/lib/brand";
import { faqs, fullProcess, offerings, processStages } from "@/lib/content";

export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  tags: string[];
};

export const assistantKnowledge: KnowledgeChunk[] = [
  {
    id: "brand",
    title: "What Upskyla is",
    text: `${brand.name} (${brand.wordmark}) — ${brand.tagline}. ${brand.heroSupport} Website ${brand.websiteLabel}. Phone ${brand.phones.join(" and ")}.`,
    tags: ["upskyla", "about", "what", "company", "platform", "training", "recruitment"],
  },
  {
    id: "courses",
    title: "Courses and prices",
    text: "Three courses: IT Job Preparation (original ₹3,999, offer ₹2,999) for technology roles; Non-IT Job Preparation (₹3,999 / ₹2,999) for business and operations roles; IT + Non-IT Combined (₹5,999 / ₹3,999) for both. Enrollment becomes active only after payment is verified on the server. Your course decides which jobs you can open.",
    tags: ["course", "price", "fee", "it", "non-it", "combined", "cost", "payment", "rupee"],
  },
  {
    id: "payment",
    title: "Payments",
    text: "Razorpay runs when keys are configured. Without keys, a labeled demonstration checkout activates enrollment without collecting money. A checkout screen alone is not enough; the server must confirm payment.",
    tags: ["pay", "razorpay", "payment", "demo", "checkout", "enroll"],
  },
  {
    id: "eligibility",
    title: "Job eligibility",
    text: "IT students apply only to IT jobs. Non-IT students apply only to Non-IT jobs. Combined students can apply to both. Jobs may also require degree, graduation year, location, skills, languages, or a minimum assessment score. Profile, resume and consent are required before applying.",
    tags: ["job", "eligibility", "apply", "vacancy", "role", "it", "non-it"],
  },
  {
    id: "consent",
    title: "Profile sharing and consent",
    text: "Profiles are not shared automatically. Students consent when they apply. Upskyla forwards shortlisted profiles only after screening and consent. Shortlist is not a job offer. Only an explicit Joined hiring outcome means someone joined.",
    tags: ["consent", "share", "privacy", "employer", "forward", "offer", "joined"],
  },
  {
    id: "process",
    title: "How it works",
    text: processStages.map((stage) => `${stage.step} ${stage.title}: ${stage.text}`).join(" "),
    tags: ["process", "how", "steps", "register", "train", "assess", "interview"],
  },
  {
    id: "full-process",
    title: "Operating process",
    text: fullProcess.join(" "),
    tags: ["process", "operating", "workflow", "screening", "mock"],
  },
  {
    id: "offerings",
    title: "What Upskyla offers",
    text: offerings.map((item) => `${item.title}: ${item.text}`).join(" "),
    tags: ["offer", "training", "assessment", "resume", "interview", "placement"],
  },
  {
    id: "dashboard",
    title: "Student dashboard",
    text: "After login you stay on the public website with a Dashboard button. Features unlock after course purchase. Profile holds personal details, photo, education, resume, skills and assessments in one place. Jobs, applications and interviews unlock when the profile checklist is complete.",
    tags: ["dashboard", "profile", "login", "student", "unlock", "checklist"],
  },
  {
    id: "companies",
    title: "For companies",
    text: "There is no employer login. Companies share vacancies with Upskyla. Administrators publish roles, screen students, and forward consenting shortlisted candidates. Companies keep the final interview and hiring decision. Use For Companies or Contact Us to collaborate.",
    tags: ["company", "hr", "partner", "employer", "hire", "vacancy"],
  },
  {
    id: "contact",
    title: "Contact Upskyla",
    text: `Call ${brand.phones.join(" or ")}. Website ${brand.websiteLabel}. Use the Contact Us form for queries. An administrator is notified when you submit the form.`,
    tags: ["contact", "phone", "email", "help", "support", "query", "reach"],
  },
  {
    id: "guarantee",
    title: "Job guarantee",
    text: "Upskyla does not guarantee a job. It provides training, assessments, placement assistance and access to relevant hiring opportunities. Final selection rests with the hiring company.",
    tags: ["guarantee", "placement", "job", "promise", "selected"],
  },
  ...faqs.map((item, index) => ({
    id: `faq-${index}`,
    title: item.q,
    text: `${item.q} ${item.a}`,
    tags: item.q.toLowerCase().split(/\W+/).filter((word) => word.length > 3),
  })),
];

export function buildSystemPrompt() {
  const dossier = assistantKnowledge.map((chunk) => `### ${chunk.title}\n${chunk.text}`).join("\n\n");
  return `You are Upskyla Assistant, the on-site helper for ${brand.name} (${brand.websiteLabel}).

Be highly responsive, clear, and friendly. Answer in concise plain language.
Prefer facts from the knowledge dossier below. If the user asks something outside Upskyla, give a brief helpful general answer, then connect it back to how Upskyla can help when relevant.
Never invent placement statistics, partner logos, or guaranteed jobs.
Never invent admin passwords or claim a default login exists.
If you are unsure about an operational detail, say so and point people to Contact Us or phones ${brand.phones.join(" / ")}.
For course choice, payments, eligibility, consent, dashboard unlock, and company partnership, stay faithful to the dossier.

KNOWLEDGE DOSSIER:
${dossier}`;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 2);
}

export function retrieveKnowledge(question: string, limit = 4) {
  const tokens = new Set(tokenize(question));
  const scored = assistantKnowledge
    .map((chunk) => {
      const hay = tokenize(`${chunk.title} ${chunk.text} ${chunk.tags.join(" ")}`);
      let score = 0;
      for (const token of tokens) {
        if (hay.includes(token)) score += 2;
        if (chunk.tags.includes(token)) score += 3;
        if (chunk.title.toLowerCase().includes(token)) score += 2;
      }
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((item) => item.chunk);
}

export function answerFromKnowledge(question: string) {
  const hits = retrieveKnowledge(question);
  const lower = question.toLowerCase();
  if (hits.length === 0) {
    if (/(hello|hi|hey|good morning|good evening)\b/.test(lower)) {
      return `Hello! I’m the Upskyla assistant. Ask me about courses, fees, eligibility, the dashboard, company partnerships, or how applications work. For a human follow-up, use Contact Us or call ${brand.phones.join(" / ")}.`;
    }
    return `Here’s a practical way to think about it: Upskyla trains and screens graduates, then introduces eligible, consenting candidates to companies that shared a vacancy — it does not guarantee a job. For your specific question, tell me whether you mean courses, payments, eligibility, the dashboard, or contacting the team, and I’ll go deeper. You can also use Contact Us or call ${brand.phones.join(" or ")}.`;
  }
  const primary = hits[0];
  const extras = hits
    .slice(1)
    .filter((chunk) => !primary.text.includes(chunk.text.slice(0, 40)))
    .slice(0, 1)
    .map((chunk) => chunk.text)
    .join(" ");
  return `${primary.text}${extras ? ` ${extras}` : ""} Need a person to follow up? Send the Contact Us form or call ${brand.phones.join(" / ")}.`;
}
