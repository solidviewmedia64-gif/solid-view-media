import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "Solid View Media <orders@solidviewmedia.com>";

async function send(to: string, subject: string, html: string) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

function wrapper(title: string, bodyHtml: string, ctaHref: string, ctaLabel: string) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #14181f;">
    <h1 style="font-size: 20px; margin-bottom: 8px;">${title}</h1>
    <div style="font-size: 15px; line-height: 1.6; color: #374151;">${bodyHtml}</div>
    <a href="${ctaHref}"
      style="display: inline-block; margin-top: 24px; background: #9a7b4f; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 14px;">
      ${ctaLabel}
    </a>
    <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">Solid View Media</p>
  </div>`;
}

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function sendOrderConfirmedEmail(to: string, orderId: string) {
  const href = `${siteUrl()}/dashboard/orders/${orderId}`;
  await send(
    to,
    "Your order is confirmed — upload your photos",
    wrapper(
      "Thanks for your order!",
      "We've received your payment. The next step is uploading up to 25 raw property photos so we can start production.",
      href,
      "Upload Your Photos",
    ),
  );
}

export async function sendDemoReadyEmail(to: string, orderId: string) {
  const href = `${siteUrl()}/dashboard/orders/${orderId}`;
  await send(
    to,
    "Your demo is ready for review",
    wrapper(
      "Your watermarked demo is ready",
      "Log in to watch your demo reel and let us know if you'd like to approve it or request changes.",
      href,
      "Review Your Demo",
    ),
  );
}

export async function sendDeliveredEmail(to: string, orderId: string) {
  const href = `${siteUrl()}/dashboard/orders/${orderId}`;
  await send(
    to,
    "Your final videos are ready to download",
    wrapper(
      "Thank you for working with us!",
      "Your finished, watermark-free videos are ready to download. If you loved the results, consider our unlimited monthly membership for all your future listings.",
      href,
      "Download Your Videos",
    ),
  );
}

export async function sendAdminNewOrderEmail(orderId: string, propertyLabel: string | null, clientEmail: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const href = `${siteUrl()}/admin/orders/${orderId}`;
  await Promise.all(
    adminEmails.map((to) =>
      send(
        to,
        "New order received",
        wrapper(
          "New order received",
          `${clientEmail} placed an order${propertyLabel ? ` for <strong>${propertyLabel}</strong>` : ""}. Raw photos will appear on the order page once uploaded.`,
          href,
          "View Order",
        ),
      ),
    ),
  );
}

export async function sendMagicLinkEmail(to: string, actionLink: string) {
  await send(
    to,
    "Your Solid View Media login link",
    wrapper(
      "Welcome to Solid View Media",
      "Click below to access your account and get started.",
      actionLink,
      "Log In",
    ),
  );
}
