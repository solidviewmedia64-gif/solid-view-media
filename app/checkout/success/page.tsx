import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-20">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-foreground">Payment received!</h1>
        <p className="mt-4 text-muted">
          Check your email for a login link — we&apos;ve sent it to the address you
          used at checkout. From there you&apos;ll be able to upload your property
          photos and track your order.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
