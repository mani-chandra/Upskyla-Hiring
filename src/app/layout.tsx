import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import { Providers } from "@/components/providers";
import { brand } from "@/lib/brand";
import { bootstrap } from "@/server/bootstrap";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Upskyla", template: "%s · Upskyla" },
  description: brand.heroSupport,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await bootstrap();
  return (
    <html lang="en">
      <body className={`${geist.variable} ${newsreader.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
