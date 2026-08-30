import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-border">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Solid View Media
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-foreground/80 hover:text-foreground">
            Pricing
          </Link>
          {profile ? (
            <>
              <Link
                href={profile.role === "admin" ? "/admin" : "/dashboard"}
                className="text-foreground/80 hover:text-foreground"
              >
                Dashboard
              </Link>
              <SignOutButton className="text-foreground/80 hover:text-foreground" />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-3.5 py-1.5 text-accent-foreground hover:bg-accent-dark"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
