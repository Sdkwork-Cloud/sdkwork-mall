export interface RecentOrder {
  id: string;
  title: string;
  status: string;
  totalCny?: number;
  createdAt?: string;
}

export interface AvailableCoupon {
  id: string;
  title: string;
  discountText?: string;
  expiresAt?: string;
}

export interface RecommendedActivity {
  id: string;
  title: string;
  description?: string;
  endAt?: string;
}

export interface MembershipInfo {
  level?: string;
  growthValue?: number;
  nextLevel?: string;
  nextLevelGrowth?: number;
}

export function formatCny(value: number | null | undefined): string {
  if (value == null) return "-";
  return `¥${value.toFixed(2)}`;
}

export function formatDate(value: string | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "待付款",
  pending_shipment: "待发货",
  pending_receipt: "待收货",
  completed: "已完成",
  cancelled: "已取消",
  after_sales: "售后中",
};

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusBadgeVariant(status: string): "default" | "secondary" | "success" | "warning" | "danger" | "outline" {
  switch (status) {
    case "pending_payment":
      return "warning";
    case "pending_shipment":
    case "pending_receipt":
      return "default";
    case "completed":
      return "success";
    case "cancelled":
      return "secondary";
    case "after_sales":
      return "danger";
    default:
      return "outline";
  }
}
