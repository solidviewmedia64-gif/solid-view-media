import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solid View Media | Staged Listing Videos in 24 Hours",
  description:
    "We turn empty-room listing photos into virtually staged walk-through videos for Central Florida agents, builders and investors. Ready in 24 hours. First video free.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Solid View Media
        </footer>
      </body>
    </html>
  );
}
