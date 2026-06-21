import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

interface MessageRow {
  body: string;
  createdAt?: string;
  id: string;
  title: string;
  type: "after-sales" | "order";
}

type MessageTab = "all" | "order" | "after-sales";

export function SdkworkMallMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [tab, setTab] = useState<MessageTab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const service = getSdkworkCommerceService();
      const [ordersResult, afterSalesResult] = await Promise.allSettled([
        service.orders.list({ page: 1, page_size: 10 }),
        service.afterSales.requests.list({ page: 1, page_size: 10 }),
      ]);

      const rows: MessageRow[] = [];
      if (ordersResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(ordersResult.value) as { items?: Record<string, unknown>[] };
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
        const payload = unwrapSdkworkCommerceResponse(afterSalesResult.value) as { items?: Record<string, unknown>[] };
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
      if (active) {
        setMessages(rows);
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const visibleMessages = useMemo(() => {
    if (tab === "all") {
      return messages;
    }
    return messages.filter((message) => message.type === tab);
  }, [messages, tab]);

  if (loading) {
    return <LoadingBlock label="加载消息..." />;
  }

  return (
    <div className="sdkwork-mall-pc-messages-page">
      <h1>消息中心</h1>
      <p>订单与售后动态聚合展示；真实 IM 会话需等待 commerce 消息 API 合约落地。</p>
      <nav className="sdkwork-mall-pc-chip-row">
        <button onClick={() => setTab("all")} type="button">全部</button>
        <button onClick={() => setTab("order")} type="button">订单</button>
        <button onClick={() => setTab("after-sales")} type="button">售后</button>
      </nav>

      {visibleMessages.length === 0 ? (
        <EmptyState description="订单与售后动态将在此展示" title="暂无消息" />
      ) : (
        <ul className="sdkwork-mall-pc-message-list">
          {visibleMessages.map((message) => (
            <li key={message.id}>
              <strong>{message.title}</strong>
              <p>{message.body}</p>
              {message.createdAt ? <span>{new Date(message.createdAt).toLocaleString()}</span> : null}
              {message.type === "order" ? <Link to="/buyer/orders">查看订单</Link> : null}
              {message.type === "after-sales" ? <Link to="/buyer/after-sales">查看售后</Link> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
