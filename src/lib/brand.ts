export const brand = {
  name: "Upskyla",
  wordmark: "UPSKYLA",
  tagline: "Your Skills. Our Support. A Stronger Career.",
  hero: "Your Skills. Your Opportunities. Your Career Starts Here.",
  heroSupport:
    "Upskyla helps graduates become job-ready through focused training, skill assessments and connections with companies actively hiring.",
  phones: ["9611673181", "7569952369"],
  websiteLabel: "www.upskyla.in",
  websiteUrl: "https://www.upskyla.in",
};

export function phoneHref(phone: string) {
  return `tel:+91${phone}`;
}
