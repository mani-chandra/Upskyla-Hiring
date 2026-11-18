import { redirect } from "next/navigation";

export default function SkillsRedirect() {
  redirect("/student/profile#skills");
}
