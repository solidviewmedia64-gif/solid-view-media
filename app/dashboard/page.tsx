import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { NewPropertyForm } from "@/components/new-property-form";
import { ManageMembershipButton } from "@/components/manage-membership-button";
import type { Order } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  const [{ data: orders }, { data: membership }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, services(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  const list = (orders ?? []) as Order[];

  return (
    <div className="container-page py-14">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Your Orders</h1>
          <p className="mt-1 text-sm text-muted">
            Track production, review demos, and download final videos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {membership && <ManageMembershipButton />}
        </div>
      </div>

      {membership && (
        <div className="mb-10 rounded-lg border border-accent/30 bg-accent/5 p-6">
          <h2 className="text-sm font-semibold text-foreground">
            Unlimited Membership Active
          </h2>
          <p className="mt-1 text-sm text-muted">
            Submit a new property below — no additional payment required.
          </p>
          <div className="mt-4">
            <NewPropertyForm />
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">You don&apos;t have any orders yet.</p>
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
          >
            View Pricing
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted-bg text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ordered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((order) => (
                <tr key={order.id} className="hover:bg-muted-bg">
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {order.property_label || "Untitled property"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted">{order.services?.name}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-muted">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
