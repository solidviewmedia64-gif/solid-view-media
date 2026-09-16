import { createClient } from "@/lib/supabase/server";
import { formatCents, cn } from "@/lib/utils";
import { CheckoutButton } from "@/components/checkout-button";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  if (error) {
    console.error("Failed to load services for /pricing:", error.message);
  }

  const list = (services ?? []) as Service[];

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-muted">
          Pay per property, or go unlimited with a monthly membership.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {list.map((service) => {
          const isMembership = service.billing_type === "subscription";
          return (
            <div
              key={service.id}
              className={cn(
                "flex flex-col rounded-xl border p-8",
                isMembership ? "border-accent bg-accent/5" : "border-border bg-card",
              )}
            >
              {isMembership && (
                <span className="mb-3 inline-block w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  Best for repeat listings
                </span>
              )}
              <h2 className="text-lg font-medium text-foreground">{service.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
              <div className="mt-6 text-3xl font-semibold text-foreground">
                {formatCents(service.price_cents)}
                {isMembership && (
                  <span className="text-sm font-normal text-muted"> / month</span>
                )}
              </div>
              <div className="mt-8">
                <CheckoutButton
                  serviceId={service.id}
                  label={isMembership ? "Subscribe" : "Get Started"}
                  className={cn(
                    "w-full rounded-md px-4 py-2.5 text-sm font-medium transition disabled:opacity-60",
                    isMembership
                      ? "bg-accent text-accent-foreground hover:bg-accent-dark"
                      : "border border-border text-foreground hover:border-accent",
                  )}
                />
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted">
            Pricing is being updated — please check back shortly.
          </p>
        )}
      </div>
    </div>
  );
}
