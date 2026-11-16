export const brand = {
  name: "Upskyla",
  wordmark: "UPSKYLA",
  tagline: "Your Skills. Our Support. A Stronger Career.",
  hero: "Your Skills. Your Opportunities. Your Career Starts Here.",
  heroSupport:
    "Upskyla is a training and recruitment desk for graduates. You enroll in an IT, Non-IT, or combined course, complete a profile and scored assessments, and apply only to roles your course allows. Upskyla screens consenting applicants. The hiring company makes the final decision. A job is not guaranteed.",
  phones: ["9611673181", "7569952369"],
  websiteLabel: "www.upskyla.in",
  websiteUrl: "https://www.upskyla.in",
};

export function phoneHref(phone: string) {
  return `tel:+91${phone}`;
}
