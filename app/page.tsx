import Image from "next/image";
import Link from "next/link";

const PHONE_DISPLAY = "(901) 424-1607";
const PHONE_LINK = "tel:+19014241607";
const SAMPLE_LINK =
  "mailto:solidviewmedia64@gmail.com?subject=Free%20sample%20video%20request&body=Hi%20Eunice%2C%20I%27d%20like%20a%20free%20sample%20video.%20Here%20is%20my%20listing%20link%3A%20";

export default function HomePage() {
  return (
    <div>
      {/* Welcome area */}
      <section className="bg-cream text-foreground">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="order-2 md:order-1">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gold-dark">
              For Central Florida agents, builders &amp; investors
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Empty rooms don&apos;t sell homes. We fix that in 24 hours.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-foreground/75">
              Send us your listing photos. We turn them into a short walk-through
              video with the rooms virtually furnished, so buyers can picture
              themselves living there. No movers. No rental furniture. No waiting.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={SAMPLE_LINK}
                className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-brand-dark transition hover:bg-gold-light"
              >
                Get a free sample video
              </a>
              <Link
                href="/pricing"
                className="rounded-md border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              Questions? Call or text{" "}
              <a href={PHONE_LINK} className="font-medium text-gold-dark hover:underline">
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
          <div className="order-1 flex justify-center rounded-2xl bg-brand-dark p-8 md:order-2 md:p-10">
            <Image
              src="/logo-full.png"
              alt="Solid View Media. Fast. Polished. Sold."
              width={900}
              height={664}
              priority
              className="h-auto w-full max-w-[260px] md:max-w-md"
            />
          </div>
        </div>
      </section>

      {/* See the difference */}
      <section className="py-20">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              See the difference
            </h2>
            <p className="mt-4 text-muted">
              Real listing photos from 520 Georgetown Dr, before and after our
              virtual staging.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
            <BeforeAfter room="Living room" before="/demo/family-before.jpg" after="/demo/family-after.jpg" />
            <BeforeAfter room="Bedroom" before="/demo/bedroom-before.jpg" after="/demo/bedroom-after.jpg" />
            <div className="mx-auto w-full max-w-[260px]">
              <video
                className="aspect-[9/16] w-full rounded-xl bg-brand-dark object-cover shadow-lg"
                src="/demo/georgetown-clip.mp4"
                poster="/demo/georgetown-poster.jpg"
                controls
                playsInline
                preload="none"
              />
              <p className="mt-3 text-center text-sm text-muted">
                The 15-second social video for the same home
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted">
            Furniture and decor shown are virtually staged.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container-page">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground md:text-3xl">
            How it works
          </h2>
          <div className="grid gap-10 md:grid-cols-3">
            <Step
              number="1"
              title="Send your photos"
              body="Share your listing link or upload your photos. Empty rooms are perfect."
            />
            <Step
              number="2"
              title="We stage and edit"
              body="We furnish the rooms virtually and build a polished walk-through video with your name and logo."
            />
            <Step
              number="3"
              title="Share it in 24 hours"
              body="You get a 30-second video for your listing and YouTube, and a 15-second video for Instagram and Facebook."
            />
          </div>
        </div>
      </section>

      {/* Why agents use it */}
      <section className="border-t border-border bg-muted-bg py-20">
        <div className="container-page grid gap-10 md:grid-cols-3">
          <Reason
            title="Buyers stop scrolling"
            body="A furnished room catches the eye on Instagram, Facebook and listing sites far more than an empty one."
          />
          <Reason
            title="Cheaper than real staging"
            body="No furniture rental, no movers, no scheduling. Just send photos."
          />
          <Reason
            title="Try it free"
            body="Your first video is on us. If you like it, we'll make the next one for $350."
          />
        </div>
      </section>

      {/* Bottom call to action */}
      <section className="border-t border-border bg-cream py-16 text-center text-foreground">
        <div className="container-page">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Have an empty listing right now?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/75">
            Send the link. We&apos;ll send you a free staged video, ready to post.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={SAMPLE_LINK}
              className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-brand-dark transition hover:bg-gold-light"
            >
              Get a free sample video
            </a>
            <a
              href={PHONE_LINK}
              className="rounded-md border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:border-gold"
            >
              Call or text {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-brand-dark">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function BeforeAfter({ room, before, after }: { room: string; before: string; after: string }) {
  return (
    <div>
      <h3 className="mb-3 text-center text-lg font-medium text-foreground">{room}</h3>
      <div className="grid grid-cols-2 gap-3">
        <figure>
          <Image
            src={before}
            alt={`${room} before staging, empty`}
            width={750}
            height={1000}
            className="aspect-[3/4] w-full rounded-lg object-cover"
          />
          <figcaption className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
            Before
          </figcaption>
        </figure>
        <figure>
          <Image
            src={after}
            alt={`${room} after virtual staging, furnished`}
            width={750}
            height={1000}
            className="aspect-[3/4] w-full rounded-lg object-cover ring-2 ring-gold"
          />
          <figcaption className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-gold-dark">
            After
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function Reason({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="mb-3 h-1 w-10 rounded bg-gold" />
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
