import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", id)
    .single();

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "demo_ready") {
    return NextResponse.json({ error: "Order is not awaiting demo review" }, { status: 409 });
  }

  const { error } = await supabase.from("orders").update({ status: "approved" }).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to approve" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
