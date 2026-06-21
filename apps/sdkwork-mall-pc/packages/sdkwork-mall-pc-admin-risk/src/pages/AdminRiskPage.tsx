import { useEffect, useState } from "react";
import { Button, EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

interface RiskSignalRow {
  id: string;
  level: string;
  shopId: string;
  shopName: string;
  status: string;
  type: string;
}

export function SdkworkMallAdminRiskPage() {
  const [signals, setSignals] = useState<RiskSignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySignalId, setBusySignalId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const service = getSdkworkCommerceService();
    const shopsResponse = await service.admin.shops.management.list({ page: 1, page_size: 10 });
    const shopsPayload = unwrapSdkworkCommerceResponse(shopsResponse) as { items?: Record<string, unknown>[] };
    const shops = shopsPayload.items ?? [];
    const rows: RiskSignalRow[] = [];

    for (const shop of shops.slice(0, 5)) {
      const shopId = String(shop.id ?? "");
      if (!shopId) {
        continue;
      }
      try {
        const riskResponse = await service.admin.shops.riskSignals.list({ shopId, page: 1, page_size: 5 });
        const riskPayload = unwrapSdkworkCommerceResponse(riskResponse) as { items?: Record<string, unknown>[] };
        for (const signal of riskPayload.items ?? []) {
          rows.push({
            id: String(signal.id ?? ""),
            shopId,
            shopName: String(shop.name ?? shop.title ?? shopId),
            type: String(signal.signalType ?? signal.type ?? "risk"),
            level: String(signal.riskLevel ?? signal.level ?? "medium"),
            status: String(signal.signalStatus ?? signal.status ?? "open"),
          });
        }
      } catch {
        // Shop may have no risk endpoint in dev environments.
      }
    }

    setSignals(rows);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function resolveSignal(signal: RiskSignalRow) {
    setBusySignalId(signal.id);
    try {
      const service = getSdkworkCommerceService();
      await service.admin.shops.riskSignals.resolve(signal.shopId, signal.id, {
        resolution: "reviewed",
      });
      await refresh();
    } finally {
      setBusySignalId(null);
    }
  }

  if (loading) {
    return <LoadingBlock label="加载风控信号..." />;
  }

  return (
    <div>
      <h1>风控中心</h1>
      <p>监控异常订单、高风险商家与待处理风险信号。</p>
      {signals.length === 0 ? (
        <EmptyState description="当前无活跃风险信号" title="风控状态良好" />
      ) : (
        <table className="sdkwork-mall-pc-table">
          <thead>
            <tr>
              <th>店铺</th>
              <th>类型</th>
              <th>等级</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => (
              <tr key={signal.id}>
                <td>{signal.shopName}</td>
                <td>{signal.type}</td>
                <td>{signal.level}</td>
                <td>{signal.status}</td>
                <td>
                  {signal.status !== "resolved" ? (
                    <Button
                      disabled={busySignalId === signal.id}
                      onClick={() => void resolveSignal(signal)}
                      type="button"
                    >
                      标记已处理
                    </Button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
