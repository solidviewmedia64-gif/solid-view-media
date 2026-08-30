import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MembershipStatus } from "@/lib/types";
import {
  sendAdminNewOrderEmail,
  sendMagicLinkEmail,
  sendOrderConfirmedEmail,
} from "@/lib/email/resend";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: Stripe.Subscription.Status): MembershipStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  return "canceled";
}

async function findOrCreateProfile(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  userIdHint?: string,
) {
  if (userIdHint) {
    const { data } = await admin.from("profiles").select("*").eq("id", userIdHint).single();
    if (data) return data;
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !created.user) {
    throw new Error(`Failed to create auth user for ${email}: ${error?.message}`);
  }

  // The on_auth_user_created trigger inserts the profiles row synchronously.
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", created.user.id)
    .single();

  if (!profile) throw new Error(`Profile not found after user creation for ${email}`);
  return profile;
}

async function handleCheckoutCompleted(
  admin: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
) {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) return;

  const serviceId = session.metadata?.service_id;
  const propertyLabel = session.metadata?.property_label || null;
  const userIdHint = session.metadata?.user_id || undefined;

  const profile = await findOrCreateProfile(admin, email, userIdHint);

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (customerId && profile.stripe_customer_id !== customerId) {
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id);
  }

  if (!serviceId) return;

  const { data: service } = await admin
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();
  if (!service) return;

  // Subscriptions (membership) don't create a property order on their own —
  // the client creates individual property orders from the dashboard once
  // the membership is active.
  if (service.billing_type === "subscription") return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  const { data: order } = await admin
    .from("orders")
    .insert({
      user_id: profile.id,
      service_id: service.id,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId ?? null,
      property_label: propertyLabel,
      status: "awaiting_upload",
      amount_paid_cents: session.amount_total ?? service.price_cents,
    })
    .select("id")
    .single();

  if (!order) return;

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=${encodeURIComponent(`/dashboard/orders/${order.id}`)}`;
  const { data: link } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (link?.properties?.action_link) {
    await sendMagicLinkEmail(email, link.properties.action_link);
  }
  await sendOrderConfirmedEmail(email, order.id);
  await sendAdminNewOrderEmail(order.id, propertyLabel, email);
}

async function handleSubscriptionEvent(
  admin: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription,
) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  let userId = subscription.metadata?.user_id || undefined;
  if (!userId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = profile?.id;
  }
  if (!userId) return;

  const item = subscription.items.data[0];
  const periodEndUnix = item?.current_period_end ?? null;

  await admin.from("memberships").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: mapSubscriptionStatus(subscription.status),
      current_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
    },
    { onConflict: "stripe_subscription_id" },
  );
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(admin, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(admin, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
