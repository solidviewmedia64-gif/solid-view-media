"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function NewPropertyForm() {
  const router = useRouter();
  const [propertyLabel, setPropertyLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create property");
      router.push(`/dashboard/orders/${data.orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        required
        value={propertyLabel}
        onChange={(e) => setPropertyLabel(e.target.value)}
        placeholder="Property address or nickname"
        className="min-w-64 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
      >
        {loading ? "Creating…" : "+ New Property"}
      </button>
      {error && <p className="w-full text-xs text-danger">{error}</p>}
    </form>
  );
}
