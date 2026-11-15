import type { PrismaClient } from "@/generated/prisma/client";
import { CourseCategory, QuestionType } from "@/generated/prisma/client";

const skills = [
  "Python",
  "C",
  "C++",
  "Java",
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "SQL",
  "MySQL",
  "Data Structures",
  "Machine Learning",
  "Excel",
  "Tableau",
  "Power BI",
  "Git and GitHub",
];

const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Other"];

const courses = [
  {
    slug: "it",
    name: "IT Job Preparation",
    category: CourseCategory.IT,
    summary: "Preparation for technology roles: programming, data, web fundamentals and interview practice.",
    description:
      "A focused preparation course for graduates aiming at technology roles. It covers technical practice, communication and the assessments Upskyla uses before sharing a profile.",
    originalPrice: 3999,
    offerPrice: 2999,
  },
  {
    slug: "non-it",
    name: "Non-IT Job Preparation",
    category: CourseCategory.NON_IT,
    summary: "Preparation for business, operations and customer-facing roles.",
    description:
      "A focused preparation course for graduates aiming at non-technology roles. It covers workplace communication, customer handling and the assessments used in screening.",
    originalPrice: 3999,
    offerPrice: 2999,
  },
  {
    slug: "combined",
    name: "IT + Non-IT Combined",
    category: CourseCategory.COMBINED,
    summary: "One enrollment that opens both technology and non-technology vacancies.",
    description:
      "Preparation across technology and non-technology hiring tracks. Combined students can access both IT and Non-IT vacancies after enrollment is active.",
    originalPrice: 5999,
    offerPrice: 3999,
  },
];

type Option = { text: string; correct?: boolean };
type QuestionSeed = {
  type: QuestionType;
  prompt: string;
  skill?: string;
  options?: Option[];
};

const assessments: {
  slug: string;
  title: string;
  summary: string;
  appliesTo: CourseCategory[];
  questions: QuestionSeed[];
}[] = [
  {
    slug: "it-foundations",
    title: "IT foundations",
    summary: "Short scored check across programming, data and web fundamentals.",
    appliesTo: [CourseCategory.IT, CourseCategory.COMBINED],
    questions: [
      {
        type: QuestionType.MCQ,
        skill: "Python",
        prompt: "What does len(\"upskyla\") evaluate to in Python?",
        options: [
          { text: "6" },
          { text: "7", correct: true },
          { text: "8" },
          { text: "An error, because len is not a function" },
        ],
      },
      {
        type: QuestionType.MCQ,
        skill: "SQL",
        prompt: "Which SQL clause keeps only the rows that match a condition?",
        options: [
          { text: "ORDER BY" },
          { text: "WHERE", correct: true },
          { text: "GROUP BY" },
          { text: "LIMIT" },
        ],
      },
      {
        type: QuestionType.MCQ,
        skill: "JavaScript",
        prompt: "Which keyword declares a binding that cannot be reassigned?",
        options: [
          { text: "var" },
          { text: "let" },
          { text: "const", correct: true },
          { text: "def" },
        ],
      },
      {
        type: QuestionType.MULTI_SELECT,
        skill: "HTML",
        prompt: "Which of these are used directly to build a typical web page in the browser?",
        options: [
          { text: "HTML", correct: true },
          { text: "CSS", correct: true },
          { text: "MySQL" },
          { text: "Excel" },
        ],
      },
      {
        type: QuestionType.PROGRAMMING_OUTPUT,
        skill: "Python",
        prompt: "What is printed by print(2 + 3 * 2)?",
        options: [
          { text: "10" },
          { text: "8", correct: true },
          { text: "7" },
          { text: "12" },
        ],
      },
      {
        type: QuestionType.MCQ,
        skill: "Data Structures",
        prompt: "Which structure returns items in first-in, first-out order?",
        options: [
          { text: "Stack" },
          { text: "Queue", correct: true },
          { text: "Binary heap used as a priority queue" },
          { text: "Set" },
        ],
      },
      {
        type: QuestionType.MCQ,
        skill: "Git and GitHub",
        prompt: "Which Git command records the current staged snapshot in the local history?",
        options: [
          { text: "git push" },
          { text: "git clone" },
          { text: "git commit", correct: true },
          { text: "git branch" },
        ],
      },
      {
        type: QuestionType.CODING,
        skill: "Python",
        prompt: "Write a Python function larger(a, b) that returns the greater of the two numbers. Your answer is reviewed by an administrator and is not executed on the server.",
      },
    ],
  },
  {
    slug: "workplace-communication",
    title: "Workplace communication",
    summary: "Scenarios for interviews, writing and working with other people.",
    appliesTo: [CourseCategory.IT, CourseCategory.NON_IT, CourseCategory.COMBINED],
    questions: [
      {
        type: QuestionType.SCENARIO,
        prompt: "An interviewer says, “Tell me about yourself.” Which opening is the strongest?",
        options: [
          { text: "A detailed account of childhood and school" },
          { text: "A short summary of your education, relevant skills and the kind of role you want", correct: true },
          { text: "Your expected salary, before they describe the role" },
          { text: "A joke, then wait for the next question" },
        ],
      },
      {
        type: QuestionType.COMMUNICATION,
        prompt: "Which sentence is the clearest update to a manager?",
        options: [
          { text: "The report is kind of done maybe tomorrow." },
          { text: "I will send the completed report by 4 pm today.", correct: true },
          { text: "Report??" },
          { text: "As per my previous email please do the needful ASAP regarding the same." },
        ],
      },
      {
        type: QuestionType.SCENARIO,
        prompt: "A teammate misses a shared deadline and you still need their section. What should you do first?",
        options: [
          { text: "Complain about them in the team chat" },
          { text: "Tell them what you still need and agree a time today", correct: true },
          { text: "Submit the work without their section and say nothing" },
          { text: "Wait silently until someone else notices" },
        ],
      },
      {
        type: QuestionType.COMMUNICATION,
        prompt: "A customer is upset about a delayed reply. Which response is professional?",
        options: [
          { text: "That is not my department." },
          { text: "I am sorry for the delay. I am looking at this now and will update you by 5 pm.", correct: true },
          { text: "Calm down." },
          { text: "You should have called yesterday." },
        ],
      },
    ],
  },
  {
    slug: "non-it-scenarios",
    title: "Non-IT workplace scenarios",
    summary: "Customer handling, spreadsheets and everyday prioritisation.",
    appliesTo: [CourseCategory.NON_IT, CourseCategory.COMBINED],
    questions: [
      {
        type: QuestionType.SCENARIO,
        prompt: "Two customers are waiting and your manager asks for a stock count before lunch. What do you handle first?",
        options: [
          { text: "The customers who are already waiting, then the stock count", correct: true },
          { text: "The stock count, and ask the customers to come back tomorrow" },
          { text: "Neither, until you finish your break" },
          { text: "Whichever task is easier" },
        ],
      },
      {
        type: QuestionType.MCQ,
        skill: "Excel",
        prompt: "In Excel, which character starts a formula?",
        options: [
          { text: "#" },
          { text: "=", correct: true },
          { text: "@" },
          { text: "/" },
        ],
      },
      {
        type: QuestionType.SCENARIO,
        prompt: "A caller wants a refund you are not allowed to approve. What is the right next step?",
        options: [
          { text: "Promise the refund so they will hang up" },
          { text: "Explain the limit, record the request and pass it to the person who can decide", correct: true },
          { text: "End the call" },
          { text: "Ask them to email a different company" },
        ],
      },
      {
        type: QuestionType.MCQ,
        prompt: "What is a CRM mainly used to keep?",
        options: [
          { text: "Source code" },
          { text: "Customer and sales interactions", correct: true },
          { text: "Payroll tax tables only" },
          { text: "Office floor plans" },
        ],
      },
    ],
  },
];

export async function seedIfEmpty(prisma: PrismaClient) {
  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      create: { name, category: "technical" },
      update: { category: "technical" },
    });
  }
  for (const name of languages) {
    await prisma.language.upsert({ where: { name }, create: { name }, update: {} });
  }
  const criteria = [
    ["Technical clarity", "How clearly the candidate explains the work they have done.", 1],
    ["Communication", "Structure, listening and professional language.", 2],
    ["Problem solving", "How they approach an unfamiliar question.", 3],
    ["Role fit", "Evidence they can do the work described in the vacancy.", 4],
    ["Professionalism", "Punctuality, respect and how they receive feedback.", 5],
  ] as const;
  for (const [name, description, sortOrder] of criteria) {
    await prisma.scoringCriterion.upsert({
      where: { name },
      create: { name, description, maxScore: 5, sortOrder, active: true },
      update: { description, sortOrder, active: true },
    });
  }
  for (const course of courses) {
    const saved = await prisma.course.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        name: course.name,
        category: course.category,
        summary: course.summary,
        description: course.description,
      },
      update: {
        name: course.name,
        summary: course.summary,
        description: course.description,
        active: true,
      },
    });
    const pricing = await prisma.coursePricing.count({ where: { courseId: saved.id } });
    if (pricing === 0) {
      await prisma.coursePricing.create({
        data: {
          courseId: saved.id,
          originalPrice: course.originalPrice,
          offerPrice: course.offerPrice,
          label: "New Batch Offer",
          active: true,
        },
      });
    }
  }

  const skillRows = await prisma.skill.findMany();
  const skillId = new Map(skillRows.map((skill) => [skill.name, skill.id]));
  for (const assessment of assessments) {
    const saved = await prisma.assessment.upsert({
      where: { slug: assessment.slug },
      create: {
        slug: assessment.slug,
        title: assessment.title,
        summary: assessment.summary,
        appliesTo: assessment.appliesTo,
      },
      update: { title: assessment.title, summary: assessment.summary, appliesTo: assessment.appliesTo },
    });
    const existing = await prisma.assessmentQuestion.count({ where: { assessmentId: saved.id } });
    if (existing > 0) continue;
    for (const [index, question] of assessment.questions.entries()) {
      await prisma.assessmentQuestion.create({
        data: {
          assessmentId: saved.id,
          type: question.type,
          prompt: question.prompt,
          skillId: question.skill ? skillId.get(question.skill) : null,
          points: question.type === QuestionType.CODING ? 5 : 1,
          sortOrder: index + 1,
          options: question.options
            ? { create: question.options.map((option, optionIndex) => ({ text: option.text, isCorrect: Boolean(option.correct), sortOrder: optionIndex + 1 })) }
            : undefined,
        },
      });
    }
  }

  const companies = await prisma.company.count();
  if (companies > 0) return;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 60);
  const sample = [
    {
      name: "Northwind Analytics (sample)",
      industry: "Software",
      location: "Hyderabad",
      hrName: "Sample HR contact",
      hrEmail: "hr.sample.northwind@example.com",
      hrPhone: "9000000001",
      notes: "Sample record for the product demonstration. Not a signed hiring partner.",
      job: {
        title: "Junior software trainee",
        category: "IT" as const,
        description: "A sample technology vacancy used to show how Upskyla publishes roles. This company is not a real hiring partner.",
        responsibilities: "Practice service tasks, fix small defects, and write clear updates for a mentor.",
        qualification: "A completed bachelor's degree in any discipline.",
        experience: "Fresh graduates",
        salaryText: "Sample range discussed with the company",
        location: "Hyderabad",
        skills: ["Python", "SQL"],
      },
    },
    {
      name: "Harbour and Co. Retail (sample)",
      industry: "Retail",
      location: "Vijayawada",
      hrName: "Sample HR contact",
      hrEmail: "hr.sample.harbour@example.com",
      hrPhone: "9000000002",
      notes: "Sample record for the product demonstration. Not a signed hiring partner.",
      job: {
        title: "Store operations associate",
        category: "NON_IT" as const,
        description: "A sample non-technology vacancy used to show course eligibility. This company is not a real hiring partner.",
        responsibilities: "Help customers, keep stock records and coordinate with the store lead.",
        qualification: "A completed bachelor's degree in any discipline.",
        experience: "Fresh graduates",
        salaryText: "Sample range discussed with the company",
        location: "Vijayawada",
        skills: ["Excel"],
      },
    },
  ];
  for (const item of sample) {
    const company = await prisma.company.create({
      data: {
        name: item.name,
        industry: item.industry,
        location: item.location,
        hrName: item.hrName,
        hrEmail: item.hrEmail,
        hrPhone: item.hrPhone,
        partnershipStatus: "PROSPECT",
        internalNotes: item.notes,
        isSample: true,
        website: null,
      },
    });
    const categories = item.job.category === "IT" ? [CourseCategory.IT, CourseCategory.COMBINED] : [CourseCategory.NON_IT, CourseCategory.COMBINED];
    const job = await prisma.jobDescription.create({
      data: {
        companyId: company.id,
        title: item.job.title,
        category: item.job.category,
        description: item.job.description,
        responsibilities: item.job.responsibilities,
        qualification: item.job.qualification,
        experience: item.job.experience,
        salaryText: item.job.salaryText,
        location: item.job.location,
        employmentType: "FULL_TIME",
        vacancies: 2,
        applicationDeadline: deadline,
        status: "PUBLISHED",
        publishedAt: new Date(),
        eligibility: {
          create: { courseCategories: categories, graduationYearMin: 2018, graduationYearMax: 2028 },
        },
      },
    });
    await prisma.jobRequirement.createMany({
      data: item.job.skills.map((name) => ({ jobId: job.id, skillId: skillId.get(name)!, required: true })),
    });
  }
}
