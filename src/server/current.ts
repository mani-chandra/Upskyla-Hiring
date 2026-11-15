import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStudentBundle } from "@/server/profile";
import { getPrisma } from "@/server/db";

export async function currentStudent() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") redirect("/login");
  const student = await getStudentBundle(session.user.id);
  if (!student) redirect("/login");
  if (!student.emailVerified) redirect(`/verify-email?userId=${student.id}`);
  if (!student.phoneVerified) redirect(`/verify-phone?userId=${student.id}`);
  return student;
}

export async function currentAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const prisma = await getPrisma();
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!admin) redirect("/login");
  return admin;
}
