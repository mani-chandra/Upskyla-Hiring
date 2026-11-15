import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { auth } from "@/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-mist">
      <SiteHeader signedIn={Boolean(session?.user)} />
      {children}
      <SiteFooter />
    </div>
  );
}
