"use client";

import { useEffect, useState } from "react";

interface MediaFile {
  id: string;
  name: string | null;
  url: string;
}

export function MediaGallery({
  orderId,
  kind,
  emptyLabel,
}: {
  orderId: string;
  kind: "raw" | "demo";
  emptyLabel: string;
}) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/media?kind=${kind}`)
      .then((res) => res.json())
      .then((data) => setFiles(data.files ?? []))
      .catch(() => setFiles([]));
  }, [orderId, kind]);

  if (files === null) return <p className="text-sm text-muted">Loading…</p>;
  if (files.length === 0) return <p className="text-sm text-muted">{emptyLabel}</p>;

  if (kind === "raw") {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {files.map((file) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={file.id}
            src={file.url}
            alt={file.name ?? "Property photo"}
            className="aspect-square w-full rounded-md border border-border object-cover"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <video key={file.id} controls className="w-full rounded-lg border border-border bg-black">
          <source src={file.url} />
        </video>
      ))}
    </div>
  );
}
