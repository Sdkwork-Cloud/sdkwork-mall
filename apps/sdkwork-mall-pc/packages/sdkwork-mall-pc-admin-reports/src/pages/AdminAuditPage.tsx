import { useEffect, useState } from "react";
import { EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

export function SdkworkMallAdminAuditPage() {
  const [events, setEvents] = useState<Array<{ action: string; actor: string; id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const service = getSdkworkCommerceService();
      const response = await service.admin.audit.commerceEvents.list({ page: 1, page_size: 20 });
      const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
      if (active) {
        setEvents(
          payload.items?.map((item) => ({
            id: String(item.id ?? ""),
            actor: String(item.actorId ?? item.actor ?? "system"),
            action: String(item.action ?? item.eventType ?? "event"),
          })) ?? [],
        );
        setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingBlock label="加载审计日志..." />;
  }

  return (
    <div>
      <h1>审计日志</h1>
      {events.length === 0 ? (
        <EmptyState description="平台操作记录将在此展示" title="暂无审计事件" />
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>{event.actor} — {event.action}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
