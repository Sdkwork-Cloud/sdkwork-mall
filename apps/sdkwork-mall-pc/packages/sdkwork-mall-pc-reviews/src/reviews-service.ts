import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";

import { getSdkworkReviewsRemotePort } from "./reviews-remote-port";

export interface MallPendingReviewOrder {
  id: string;
  status: string;
  title: string;
}

export async function loadMallPendingReviewOrders(): Promise<MallPendingReviewOrder[]> {
  const response = await getSdkworkReviewsRemotePort().listOrders({ page: 1, page_size: 20 });
  const payload = unwrapSdkworkPaymentResponse(response) as { items?: Record<string, unknown>[] };
  return (
    payload.items
      ?.filter((item) => String(item.status ?? "") === "completed")
      .map((item) => ({
        id: String(item.id ?? ""),
        title: String(item.subject ?? item.title ?? "订单"),
        status: "pending-review",
      })) ?? []
  );
}
