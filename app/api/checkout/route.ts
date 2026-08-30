import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  serviceId: z.string().uuid(),
  propertyLabel: z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { serviceId, propertyLabel } = parsed.data;

  const admin = createAdminClient();
  const { data: service, error } = await admin
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  if (error || !service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  // If the user is already logged in, pre-fill their email and attach their
  // Stripe customer id (if any) so repeat purchases reuse the same customer.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerEmail: string | undefined;
  let stripeCustomerId: string | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", user.id)
      .single();
    customerEmail = profile?.email ?? user.email ?? undefined;
    stripeCustomerId = profile?.stripe_customer_id ?? undefined;
  }

  const session = await stripe.checkout.sessions.create({
    mode: service.billing_type === "subscription" ? "subscription" : "payment",
    line_items: [{ price: service.stripe_price_id, quantity: 1 }],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/pricing`,
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail,
    client_reference_id: user?.id,
    metadata: {
      service_id: service.id,
      property_label: propertyLabel ?? "",
      user_id: user?.id ?? "",
    },
    subscription_data:
      service.billing_type === "subscription"
        ? { metadata: { service_id: service.id, user_id: user?.id ?? "" } }
        : undefined,
  });

  return NextResponse.json({ url: session.url });
}
