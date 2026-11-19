import { AssistantWidget } from "@/components/site/assistant";
import { AtmosphereEffects } from "@/components/site/atmosphere";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { auth } from "@/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="public-shell min-h-screen">
      <AtmosphereEffects />
      <SiteHeader signedIn={Boolean(session?.user)} />
      {children}
      <SiteFooter />
      <AssistantWidget />
    </div>
  );
}
