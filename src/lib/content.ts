export const processStages = [
  {
    step: "01",
    title: "Register",
    text: "Create an account with your name, email and phone. Confirm both so Upskyla can send course updates, assessment notices and interview times to the right person.",
  },
  {
    step: "02",
    title: "Train",
    text: "Pick the IT, Non-IT, or combined course. Your enrollment becomes active only after payment is verified on the server, and that course decides which vacancies you can open.",
  },
  {
    step: "03",
    title: "Get assessed",
    text: "Record what you know, then sit separate scored tests. Self-reported skills stay distinct from verified results, so a company sees both the claim and the evidence.",
  },
  {
    step: "04",
    title: "Apply for jobs",
    text: "Read published vacancies and apply only where your course, degree, scores and deadline match. Each application includes consent to share that profile.",
  },
  {
    step: "05",
    title: "Interview",
    text: "Upskyla runs a mock interview and records feedback. Shortlisted profiles are forwarded after screening. The company holds the final interview and the hiring decision.",
  },
];

export const fullProcess = [
  "Students and graduates register with a name, email and phone, then confirm both before the account is used for applications.",
  "They choose an IT, Non-IT, or combined course. Enrollment stays inactive until payment is verified.",
  "They add personal details, education, a photo and a private resume in PDF or DOCX.",
  "They rate their own skills and languages, then take scored assessments. Coding answers are stored for an admin to review. Student code is not executed.",
  "Upskyla uses that record for focused preparation: technical practice where the course includes it, plus communication, teamwork and customer handling for every course.",
  "Companies share open roles with Upskyla. Administrators publish the job description, requirements and deadline.",
  "Eligible students apply. The server checks course category, deadline, profile completeness, degree, scores, skills and languages before the application is accepted.",
  "Upskyla schedules a mock interview, assigns an interviewer and records scores against the criteria set for that role.",
  "A shortlisted candidate is forwarded only after they have consented to share the profile. Internal notes stay on the admin desk.",
  "The company runs the final interview. Selected, rejected, joined and declined are recorded separately. Only an explicit Joined outcome means the person joined.",
];

export const offerings = [
  { title: "Intensive training", text: "A structured path for the course you enroll in, aimed at the tasks graduates are asked to do in a first role, not a general lecture series." },
  { title: "Technical skill development", text: "Practice in the languages and tools IT and combined students need to show: programming, data, web fundamentals, and how to talk through the work." },
  { title: "Communication development", text: "Spoken and written practice for interviews, workplace updates and customer conversations. Every course includes this, including the IT track." },
  { title: "Skill assessments", text: "Scored multiple-choice, multi-select, programming-output, scenario and communication items. Free-form coding answers wait for an admin review." },
  { title: "Resume preparation", text: "A current resume sits on your private profile. Applications stay closed until that file and the rest of the required profile are in place." },
  { title: "Interview preparation", text: "A mock interview with a meeting link, an assigned interviewer and scores you can see. That round is screening, not an offer." },
  { title: "Candidate screening", text: "Upskyla checks each application against the vacancy before a profile is forwarded. Shortlist, interview and referral are not employment." },
  { title: "Placement assistance", text: "Help through applications, mock interviews and referrals to companies that have shared a role. Selection and joining remain the company’s decision." },
  { title: "Hiring opportunities", text: "Published vacancies with location, deadline and requirements. Your course filters the list: IT, Non-IT, or both if you enrolled in the combined course." },
];

export const courseNotes: Record<string, string[]> = {
  it: [
    "Programming, data and web fundamentals you can be asked to demonstrate.",
    "Technical self-assessment plus scored tests that stay separate from what you report.",
    "Opens IT vacancies only, once enrollment is active and the role’s rules match.",
  ],
  "non-it": [
    "Workplace communication, customer handling and operations scenarios.",
    "Languages and non-technical skills recorded for every student, then scored separately.",
    "Opens Non-IT vacancies only. Technology roles stay closed on this enrollment.",
  ],
  combined: [
    "Both tracks in one enrollment, including technical and workplace preparation.",
    "You can be considered for IT and Non-IT vacancies that you otherwise qualify for.",
    "Offered below the two courses bought separately. The struck price is the original fee.",
  ],
};

export const expectations = [
  { title: "One student record", text: "Course, profile, education, resume, self-reported skills and verified scores live together, so screening does not start from a blank application." },
  { title: "Rules before referral", text: "Course category, deadline, degree, graduation year, location, scores, skills and languages are checked on the server when a job sets them." },
  { title: "Consent before sharing", text: "A company does not receive your profile because you browsed a role. Sharing happens when you apply and Upskyla has finished its own screening." },
];

export const faqs = [
  {
    q: "Does Upskyla guarantee a job?",
    a: "No. Upskyla provides training, assessments, placement assistance and access to relevant hiring opportunities. Final selection rests with the hiring company.",
  },
  {
    q: "Which course should I choose?",
    a: "Choose IT if you want technology roles, Non-IT for business and operations roles, or the combined course if you want to be considered for both. Your course controls which vacancies you can open.",
  },
  {
    q: "When is my enrollment active?",
    a: "Only after payment is verified on Upskyla’s server. A successful checkout screen is not enough on its own.",
  },
  {
    q: "Can I apply for every job I see?",
    a: "No. IT students can apply for IT roles, Non-IT students for Non-IT roles, and combined students for both. A vacancy can also require a degree, graduation year, location, skills, languages or a minimum assessment score.",
  },
  {
    q: "Will my profile be shared with employers automatically?",
    a: "No. You give consent when you apply. Upskyla forwards a profile only after that consent and after its own screening.",
  },
  {
    q: "What is the difference between a self-reported skill and a verified skill?",
    a: "Self-reported skills are what you say you know. Verified skills come from scored assessments or an admin review of a coding answer. Employers and recruiters can see the difference.",
  },
  {
    q: "Does a mock interview mean I have the job?",
    a: "No. A mock interview is Upskyla’s screening round. Shortlisting, a company interview and selection are separate steps. Joining is recorded only when a company hire is confirmed.",
  },
  {
    q: "How do companies work with Upskyla?",
    a: "HR teams share vacancies with Upskyla. Administrators publish the role, screen applicants and forward consenting shortlisted candidates. Companies do not log in to this version of the platform.",
  },
];
