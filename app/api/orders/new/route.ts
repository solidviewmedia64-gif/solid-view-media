import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  propertyLabel: z.string().trim().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a property name" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "An active membership is required" }, { status: 403 });
  }

  const { data: service } = await supabase
    .from("services")
    .select("id")
    .eq("billing_type", "subscription")
    .eq("active", true)
    .limit(1)
    .single();

  if (!service) {
    return NextResponse.json({ error: "Membership service not found" }, { status: 500 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      service_id: service.id,
      property_label: parsed.data.propertyLabel,
      status: "awaiting_upload",
      amount_paid_cents: 0,
    })
    .select("id")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id });
}
