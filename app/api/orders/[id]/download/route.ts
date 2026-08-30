import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DOWNLOAD_LINK_EXPIRY_HOURS } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (!order || (order.user_id !== user.id && profile?.role !== "admin")) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "Final assets are not delivered yet" }, { status: 409 });
  }

  const admin = createAdminClient();

  const { data: assets } = await admin
    .from("final_assets")
    .select("id, storage_path")
    .eq("order_id", id)
    .order("delivered_at", { ascending: true });

  const expiresInSeconds = DOWNLOAD_LINK_EXPIRY_HOURS * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  const files = await Promise.all(
    (assets ?? []).map(async (asset) => {
      const { data: signed } = await admin.storage
        .from("final-assets")
        .createSignedUrl(asset.storage_path, expiresInSeconds);
      return {
        id: asset.id,
        name: asset.storage_path.split("/").pop(),
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  await admin.from("access_tokens").insert({
    order_id: id,
    token: crypto.randomUUID(),
    expires_at: expiresAt,
  });

  return NextResponse.json({
    files: files.filter((f) => f.url),
    expiresAt,
  });
}
