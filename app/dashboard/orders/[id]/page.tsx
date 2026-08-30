import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { PhotoUpload } from "@/components/photo-upload";
import { SubmitUploadButton } from "@/components/submit-upload-button";
import { DemoReview } from "@/components/demo-review";
import { FinalDownload } from "@/components/final-download";
import { formatDate } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/orders/${id}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*, services(*)")
    .eq("id", id)
    .single();

  if (!order || order.user_id !== user.id) notFound();

  const typedOrder = order as Order;

  const { count: rawCount } = await supabase
    .from("raw_uploads")
    .select("id", { count: "exact", head: true })
    .eq("order_id", id);

  return (
    <div className="container-page max-w-3xl py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {typedOrder.property_label || "Untitled property"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {typedOrder.services?.name} · Ordered {formatDate(typedOrder.created_at)}
          </p>
        </div>
        <StatusBadge status={typedOrder.status} />
      </div>

      <div className="rounded-xl border border-border p-8">
        {typedOrder.status === "awaiting_upload" && (
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">Upload Your Photos</h2>
            <p className="mb-5 text-sm text-muted">
              Upload up to 25 raw property photos. Once you&apos;re finished, submit
              them so we can start production.
            </p>
            <PhotoUpload orderId={typedOrder.id} existingCount={rawCount ?? 0} />
            <SubmitUploadButton orderId={typedOrder.id} disabled={(rawCount ?? 0) === 0} />
          </section>
        )}

        {typedOrder.status === "in_production" && (
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">In Production</h2>
            <p className="text-sm text-muted">
              We&apos;ve received your {rawCount ?? 0} photo{(rawCount ?? 0) === 1 ? "" : "s"} and
              production is underway. We&apos;ll email you as soon as your demo is ready to review.
            </p>
          </section>
        )}

        {(typedOrder.status === "demo_ready" || typedOrder.status === "changes_requested") && (
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">
              {typedOrder.status === "changes_requested" ? "Changes Requested" : "Review Your Demo"}
            </h2>
            <p className="mb-5 text-sm text-muted">
              {typedOrder.status === "changes_requested"
                ? "We’ve noted your requested changes and are updating your demo. We’ll email you when it’s ready again."
                : "Watch your watermarked demo below, then approve it or request changes."}
            </p>
            <DemoReview orderId={typedOrder.id} />
          </section>
        )}

        {typedOrder.status === "approved" && (
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">Demo Approved</h2>
            <p className="text-sm text-muted">
              Thanks for approving! We&apos;re preparing your final, watermark-free
              videos now and will email you as soon as they&apos;re ready to download.
            </p>
          </section>
        )}

        {typedOrder.status === "delivered" && (
          <section>
            <h2 className="mb-1 text-base font-medium text-foreground">Your Videos Are Ready</h2>
            <p className="mb-5 text-sm text-muted">
              Download links are signed and expire after 72 hours — you can
              refresh them any time from this page.
            </p>
            <FinalDownload orderId={typedOrder.id} />
          </section>
        )}
      </div>
    </div>
  );
}
