import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => ({
    label: ORDER_STATUS_LABELS[status],
    value: status,
  })),
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const { status } = await searchParams;
  const activeStatus = (status ?? "all") as OrderStatus | "all";

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, services(*), profiles(*)")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: orders } = await query;
  const list = (orders ?? []) as Order[];

  return (
    <div className="container-page py-14">
      <h1 className="text-2xl font-semibold text-foreground">All Orders</h1>
      <p className="mt-1 text-sm text-muted">Manage production, uploads, and delivery.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin" : `/admin?status=${filter.value}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              activeStatus === filter.value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-foreground hover:border-accent",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted-bg text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Property</th>
              <th className="px-5 py-3 font-medium">Client</th>
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
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-foreground hover:text-accent"
                  >
                    {order.property_label || "Untitled property"}
                  </Link>
                </td>
                <td className="px-5 py-4 text-muted">{order.profiles?.email}</td>
                <td className="px-5 py-4 text-muted">{order.services?.name}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4 text-muted">{formatDate(order.created_at)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No orders in this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
