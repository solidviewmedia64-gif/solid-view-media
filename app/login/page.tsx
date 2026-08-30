"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10 text-center text-lg font-semibold tracking-tight">
        Solid View Media
      </Link>

      {status === "sent" ? (
        <div className="rounded-lg border border-border bg-muted-bg p-6 text-center">
          <p className="text-sm text-foreground">
            Check <span className="font-medium">{email}</span> for a login link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-danger">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:opacity-60"
          >
            {status === "loading" ? "Sending link…" : "Send login link"}
          </button>
          <p className="text-center text-xs text-muted">
            No password needed — we&apos;ll email you a secure link.
          </p>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
