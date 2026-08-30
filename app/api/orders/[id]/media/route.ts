import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SIGNED_URL_SECONDS = 60 * 60; // 1 hour, used for preview/review only

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const kind = req.nextUrl.searchParams.get("kind");
  if (kind !== "demo" && kind !== "raw") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

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
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!order || (order.user_id !== user.id && profile?.role !== "admin")) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const table = kind === "demo" ? "demo_assets" : "raw_uploads";
  const bucket = kind === "demo" ? "demo-assets" : "raw-uploads";

  const { data: assets } = await admin
    .from(table)
    .select("id, storage_path")
    .eq("order_id", id)
    .order(kind === "demo" ? "uploaded_at" : "uploaded_at", { ascending: true });

  const files = await Promise.all(
    (assets ?? []).map(async (asset) => {
      const { data: signed } = await admin.storage
        .from(bucket)
        .createSignedUrl(asset.storage_path, SIGNED_URL_SECONDS);
      return {
        id: asset.id,
        name: asset.storage_path.split("/").pop(),
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  return NextResponse.json({ files: files.filter((f) => f.url) });
}
