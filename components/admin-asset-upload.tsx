"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminAssetUpload({
  orderId,
  bucket,
  table,
  label,
  accept,
}: {
  orderId: string;
  bucket: "demo-assets" | "final-assets";
  table: "demo_assets" | "final_assets";
  label: string;
  accept?: Record<string, string[]>;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      const supabase = createClient();

      for (const file of acceptedFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${orderId}/${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });

        if (uploadError) {
          setError(uploadError.message);
          break;
        }

        const { error: insertError } = await supabase.from(table).insert({
          order_id: orderId,
          storage_path: path,
        });

        if (insertError) {
          setError(insertError.message);
          break;
        }
      }

      setUploading(false);
      router.refresh();
    },
    [orderId, bucket, table, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center text-sm transition ${
        isDragActive ? "border-accent bg-accent/5" : "border-border"
      } ${uploading ? "opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="text-foreground">{uploading ? "Uploading…" : label}</p>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
