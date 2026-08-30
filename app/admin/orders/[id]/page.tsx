import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/status-badge";
import { AdminStatusControl } from "@/components/admin-status-control";
import { AdminAssetUpload } from "@/components/admin-asset-upload";
import { MediaGallery } from "@/components/media-gallery";
import { formatCents, formatDate } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, services(*), profiles(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();
  const typedOrder = order as Order;

  return (
    <div className="container-page max-w-4xl py-14">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {typedOrder.property_label || "Untitled property"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {typedOrder.profiles?.email} · {typedOrder.services?.name} ·{" "}
            {formatCents(typedOrder.amount_paid_cents ?? 0)} · Ordered{" "}
            {formatDate(typedOrder.created_at)}
          </p>
        </div>
        <StatusBadge status={typedOrder.status} />
      </div>

      <div className="mb-8 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Order Status</h2>
        <AdminStatusControl orderId={typedOrder.id} currentStatus={typedOrder.status} />
      </div>

      <div className="mb-8 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Client&apos;s Raw Photos</h2>
        <MediaGallery orderId={typedOrder.id} kind="raw" emptyLabel="No photos uploaded yet." />
      </div>

      <div className="mb-8 rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Watermarked Demo</h2>
        <p className="mb-3 text-xs text-muted">
          Upload the demo, then set status to &quot;Demo Ready&quot; above to notify the client.
        </p>
        <AdminAssetUpload
          orderId={typedOrder.id}
          bucket="demo-assets"
          table="demo_assets"
          label="Drop the watermarked demo video here, or click to browse"
          accept={{ "video/*": [] }}
        />
        <div className="mt-4">
          <MediaGallery orderId={typedOrder.id} kind="demo" emptyLabel="No demo uploaded yet." />
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Final Delivery</h2>
        <p className="mb-3 text-xs text-muted">
          Upload the finished, watermark-free files, then set status to &quot;Delivered&quot; above.
        </p>
        <AdminAssetUpload
          orderId={typedOrder.id}
          bucket="final-assets"
          table="final_assets"
          label="Drop final delivery files here, or click to browse"
        />
      </div>
    </div>
  );
}
