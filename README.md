# Upskyla

Upskyla is a training and recruitment platform. Graduates register, buy an IT, Non-IT or combined preparation course, complete a profile and assessments, and apply for vacancies their course allows. Upskyla administrators screen applications, run mock interviews and forward consenting shortlisted candidates. The hiring company makes the final decision. A job is not guaranteed, and joining is recorded only when an administrator sets that hiring outcome.

## Run it locally

```bash
npm install
npm run dev
```

The app is served at `http://127.0.0.1:3847`.

Without `DATABASE_URL`, Upskyla uses an embedded PostgreSQL-compatible database in `data/pglite`. With `DATABASE_URL`, Prisma uses that Postgres database. On a hosted build, `prisma migrate deploy` and the seed run only when `DATABASE_URL` is set.

The first administrator is created at `/setup`. That page closes after one admin exists. No default admin password is stored in the repo.

## Student path

1. Register with your name, email, Indian mobile number and a password.
2. Confirm the email code, then the phone code.
3. If Resend or MSG91 is not configured, the verification screen shows the one-time code and says delivery is not configured. When those services are configured, the code is sent and not shown.
4. Choose a course. If Razorpay keys are missing, checkout is labeled as a demonstration and does not collect money. Enrollment becomes active only after the server confirms the payment.
5. Add personal details, education, a PDF or DOCX resume, skills and a scored assessment.
6. Open a job your course allows and apply. You must consent before your profile can be shared.

IT students see IT roles. Non-IT students see Non-IT roles. Combined students see both. The same rules are enforced when the application is created.

Sample companies inside the product are marked “sample”. The public site does not present them as real hiring partners.

## Administrator path

Sign in at `/login`. The admin desk covers students, course prices, payments, assessments, companies, job descriptions, applications, interviews and hiring results. Publishing a job notifies students who already match. Internal interview notes are not shown to students.

## Environment

Leave these unset to use the local fallbacks. Set them in the host environment, not in a committed file.

| Variable | Effect |
| --- | --- |
| `DATABASE_URL` | Managed Postgres. Empty uses the embedded database. |
| `AUTH_SECRET` | Session signing secret. If empty, one is created and stored in the database. |
| `RAZORPAY_KEY_ID` | Razorpay key id. Safe to expose to the checkout script. |
| `RAZORPAY_KEY_SECRET` | Server-side order creation and signature checks. |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies `POST /api/payments/webhook`. |
| `RESEND_API_KEY` | Sends email when set with `EMAIL_FROM`. |
| `EMAIL_FROM` | From address for Resend. |
| `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` | Sends the phone OTP. The template should accept a variable named `OTP`. |
| `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Private object storage. Optional `S3_REGION` and `S3_ENDPOINT`. |
| `CLOUDINARY_URL` | Optional `cloudinary://key:secret@cloud` copy. Downloads still use the private file. |

Course prices, eligibility and assessment questions live in the database. Change a price from Admin → Courses.
