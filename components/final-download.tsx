"use client";

import { useState } from "react";
import Link from "next/link";

interface MediaFile {
  id: string;
  name: string | null;
  url: string;
}

export function FinalDownload({ orderId }: { orderId: string }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLinks() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate download link");
      setFiles(data.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {files === null ? (
        <button
          onClick={loadLinks}
          disabled={loading}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-60"
        >
          {loading ? "Generating link…" : "Get Download Link"}
        </button>
      ) : (
        <div className="space-y-2">
          {files.length === 0 && (
            <p className="text-sm text-muted">No final files found yet.</p>
          )}
          {files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm hover:border-accent"
            >
              <span className="truncate text-foreground">{file.name}</span>
              <span className="text-xs font-medium text-accent">Download</span>
            </a>
          ))}
          <button onClick={loadLinks} className="text-xs text-muted hover:text-accent">
            Refresh link
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-8 rounded-lg border border-accent/30 bg-accent/5 p-6">
        <h3 className="text-sm font-semibold text-foreground">Loved the results?</h3>
        <p className="mt-1 text-sm text-muted">
          Go unlimited with our monthly membership — submit every future listing
          under one recurring charge.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
        >
          View Membership
        </Link>
      </div>
    </div>
  );
}
