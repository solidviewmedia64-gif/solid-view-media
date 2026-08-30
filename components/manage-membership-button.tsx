"use client";

import { useState } from "react";

export function ManageMembershipButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-border px-3.5 py-1.5 text-sm text-foreground hover:border-accent disabled:opacity-60"
    >
      {loading ? "Loading…" : "Manage Membership"}
    </button>
  );
}
