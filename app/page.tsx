import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="container-page py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            For Real Estate Professionals
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Listing photos become listing-ready video.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Send us your property photos. We handle the rest — a polished,
            watermark-free reel delivered straight to your account, ready to
            share with buyers.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            >
              View Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-accent"
            >
              Client Login
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted-bg py-20">
        <div className="container-page grid gap-10 md:grid-cols-3">
          <Step
            number="01"
            title="Upload your photos"
            body="After checkout, upload up to 25 raw property photos in minutes — no editing required."
          />
          <Step
            number="02"
            title="We produce your video"
            body="Our team crafts a polished reel and sends you a watermarked demo for review."
          />
          <Step
            number="03"
            title="Approve & download"
            body="Approve the demo and receive your final, watermark-free video ready to publish."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-accent">{number}</div>
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
