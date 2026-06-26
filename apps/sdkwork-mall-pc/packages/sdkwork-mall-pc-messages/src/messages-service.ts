import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";

import { getSdkworkMessagesRemotePort } from "./messages-remote-port";

export interface MallMessageRow {
  body: string;
  createdAt?: string;
  id: string;
  title: string;
  type: "after-sales" | "order";
}

export async function loadMallMessageCenterRows(): Promise<MallMessageRow[]> {
  const remote = getSdkworkMessagesRemotePort();
  const [ordersResult, afterSalesResult] = await Promise.allSettled([
    remote.listOrders({ page: 1, page_size: 10 }),
    remote.listAfterSalesRequests({ page: 1, page_size: 10 }),
  ]);

  const rows: MallMessageRow[] = [];
  if (ordersResult.status === "fulfilled") {
    const payload = unwrapSdkworkPaymentResponse(ordersResult.value) as { items?: Record<string, unknown>[] };
    for (const item of payload.items ?? []) {
      rows.push({
        id: `order-${String(item.id ?? "")}`,
        type: "order",
        title: `订单更新：${String(item.subject ?? item.id ?? "")}`,
        body: `状态：${String(item.status ?? "unknown")}`,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
      });
    }
  }
  if (afterSalesResult.status === "fulfilled") {
    const payload = unwrapSdkworkPaymentResponse(afterSalesResult.value) as { items?: Record<string, unknown>[] };
    for (const item of payload.items ?? []) {
      rows.push({
        id: `after-sales-${String(item.id ?? "")}`,
        type: "after-sales",
        title: `售后更新：${String(item.id ?? "")}`,
        body: `状态：${String(item.status ?? "processing")}`,
        createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
      });
    }
  }
  return rows;
}
