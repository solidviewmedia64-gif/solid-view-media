import Image from "next/image";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-white/10 bg-brand-dark text-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
          <Image src="/logo-icon.png" alt="" width={256} height={292} className="h-9 w-auto" priority />
          <span>Solid View Media</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-white/80 hover:text-white">
            Pricing
          </Link>
          {profile ? (
            <>
              <Link
                href={profile.role === "admin" ? "/admin" : "/dashboard"}
                className="text-white/80 hover:text-white"
              >
                Dashboard
              </Link>
              <SignOutButton className="text-white/80 hover:text-white" />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-gold px-3.5 py-1.5 font-medium text-brand-dark hover:bg-gold-light"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
