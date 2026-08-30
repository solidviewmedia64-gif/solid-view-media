"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MediaFile {
  id: string;
  name: string | null;
  url: string;
}

export function DemoReview({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}/media?kind=demo`)
      .then((res) => res.json())
      .then((data) => setFiles(data.files ?? []))
      .catch(() => setError("Could not load your demo video."));
  }, [orderId]);

  async function respond(action: "approve" | "request-changes") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {files === null && <p className="text-sm text-muted">Loading demo…</p>}
      {files?.length === 0 && (
        <p className="text-sm text-muted">Your demo is being finalized — check back shortly.</p>
      )}
      <div className="space-y-4">
        {files?.map((file) => (
          <video key={file.id} controls className="w-full rounded-lg border border-border bg-black">
            <source src={file.url} />
          </video>
        ))}
      </div>

      {files && files.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => respond("approve")}
            disabled={busy}
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
          >
            Approve Demo
          </button>
          <button
            onClick={() => respond("request-changes")}
            disabled={busy}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent disabled:opacity-60"
          >
            Request Changes
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
