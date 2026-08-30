export type OrderStatus =
  | "awaiting_upload"
  | "in_production"
  | "demo_ready"
  | "changes_requested"
  | "approved"
  | "delivered";

export type UserRole = "client" | "admin";

export type BillingType = "one_time" | "subscription";

export type MembershipStatus = "active" | "past_due" | "canceled";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  stripe_price_id: string;
  billing_type: BillingType;
  active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  service_id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  property_label: string | null;
  status: OrderStatus;
  amount_paid_cents: number | null;
  created_at: string;
  updated_at: string;
  services?: Service;
  profiles?: Profile;
}

export interface RawUpload {
  id: string;
  order_id: string;
  storage_path: string;
  uploaded_at: string;
}

export interface DemoAsset {
  id: string;
  order_id: string;
  storage_path: string;
  uploaded_at: string;
}

export interface FinalAsset {
  id: string;
  order_id: string;
  storage_path: string;
  delivered_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: MembershipStatus;
  current_period_end: string | null;
}

export interface AccessToken {
  id: string;
  order_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_upload: "Awaiting Upload",
  in_production: "In Production",
  demo_ready: "Demo Ready",
  changes_requested: "Changes Requested",
  approved: "Approved",
  delivered: "Delivered",
};

export const MAX_RAW_UPLOADS = 25;
export const DOWNLOAD_LINK_EXPIRY_HOURS = 72;
