import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeliveredEmail, sendDemoReadyEmail } from "@/lib/email/resend";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "awaiting_upload",
  "in_production",
  "demo_ready",
  "changes_requested",
  "approved",
  "delivered",
];

const bodySchema = z.object({
  status: z.enum(STATUSES as [OrderStatus, ...OrderStatus[]]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminProfile();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("id, status, profiles(email)")
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }

  const profiles = order.profiles as unknown;
  const clientEmail = Array.isArray(profiles)
    ? profiles[0]?.email
    : (profiles as { email?: string } | null)?.email;
  if (clientEmail) {
    if (parsed.data.status === "demo_ready") {
      await sendDemoReadyEmail(clientEmail, id);
    } else if (parsed.data.status === "delivered") {
      await sendDeliveredEmail(clientEmail, id);
    }
  }

  return NextResponse.json({ ok: true });
}
