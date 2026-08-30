"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MAX_RAW_UPLOADS } from "@/lib/types";

export function PhotoUpload({
  orderId,
  existingCount,
}: {
  orderId: string;
  existingCount: number;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const remaining = MAX_RAW_UPLOADS - existingCount;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      if (acceptedFiles.length === 0) return;

      if (acceptedFiles.length > remaining) {
        setError(
          `You can upload ${remaining} more photo${remaining === 1 ? "" : "s"} (max ${MAX_RAW_UPLOADS} per property).`,
        );
        return;
      }

      setUploading(true);
      setProgress({ done: 0, total: acceptedFiles.length });
      const supabase = createClient();

      for (const file of acceptedFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${orderId}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("raw-uploads")
          .upload(path, file, { upsert: false });

        if (uploadError) {
          setError(uploadError.message);
          break;
        }

        const { error: insertError } = await supabase
          .from("raw_uploads")
          .insert({ order_id: orderId, storage_path: path });

        if (insertError) {
          setError(insertError.message);
          break;
        }

        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      setUploading(false);
      router.refresh();
    },
    [orderId, remaining, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: uploading || remaining <= 0,
  });

  if (remaining <= 0) {
    return (
      <p className="rounded-md border border-border bg-muted-bg p-4 text-sm text-muted">
        You&apos;ve reached the {MAX_RAW_UPLOADS}-photo limit for this property.
      </p>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${
          isDragActive ? "border-accent bg-accent/5" : "border-border"
        } ${uploading ? "opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-foreground">
          {isDragActive ? "Drop photos here" : "Drag & drop photos, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted">
          {remaining} of {MAX_RAW_UPLOADS} remaining · JPG or PNG
        </p>
      </div>
      {uploading && (
        <p className="mt-3 text-xs text-muted">
          Uploading {progress.done} / {progress.total}…
        </p>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
