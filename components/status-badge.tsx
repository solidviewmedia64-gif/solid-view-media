import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  awaiting_upload: "bg-amber-50 text-amber-800 border-amber-200",
  in_production: "bg-blue-50 text-blue-800 border-blue-200",
  demo_ready: "bg-violet-50 text-violet-800 border-violet-200",
  changes_requested: "bg-orange-50 text-orange-800 border-orange-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  delivered: "bg-neutral-100 text-neutral-800 border-neutral-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
