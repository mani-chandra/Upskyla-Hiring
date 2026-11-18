import { redirect } from "next/navigation";

export default function EducationRedirect() {
  redirect("/student/profile#education");
}
