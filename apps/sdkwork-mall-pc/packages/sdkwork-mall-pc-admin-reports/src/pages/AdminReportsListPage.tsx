import { useEffect, useState } from "react";
import { EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

export function SdkworkMallAdminReportsPage() {
  const [revenue, setRevenue] = useState<Array<{ period: string; amount: string }>>([]);
  const [refunds, setRefunds] = useState<Array<{ period: string; amount: string; count: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const service = getSdkworkCommerceService();
      const [revenueResult, refundsResult] = await Promise.allSettled([
        service.admin.commerceReports.orderRevenue.list({ page: 1, page_size: 10 }),
        service.admin.commerceReports.refunds.list({ page: 1, page_size: 10 }),
      ]);
      if (!active) {
        return;
      }
      if (revenueResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(revenueResult.value) as { items?: Record<string, unknown>[] };
        setRevenue(
          payload.items?.map((item) => ({
            period: String(item.period ?? item.date ?? "-"),
            amount: String(item.amount ?? item.revenue ?? "-"),
          })) ?? [],
        );
      }
      if (refundsResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(refundsResult.value) as { items?: Record<string, unknown>[] };
        setRefunds(
          payload.items?.map((item) => ({
            period: String(item.period ?? item.date ?? "-"),
            amount: String(item.amount ?? item.refundAmount ?? "-"),
            count: String(item.count ?? item.refundCount ?? "-"),
          })) ?? [],
        );
      }
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingBlock label="加载报表..." />;
  }

  const hasData = revenue.length > 0 || refunds.length > 0;

  return (
    <div>
      <h1>数据报表</h1>
      {!hasData ? (
        <EmptyState description="营收与退款报表将在此展示" title="暂无报表数据" />
      ) : (
        <>
          <section>
            <h2>订单营收</h2>
            {revenue.length === 0 ? (
              <EmptyState description="暂无营收数据" title="订单营收" />
            ) : (
              <table className="sdkwork-mall-pc-table">
                <thead><tr><th>周期</th><th>营收</th></tr></thead>
                <tbody>
                  {revenue.map((row, index) => (
                    <tr key={`${row.period}-${index}`}><td>{row.period}</td><td>{row.amount}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section>
            <h2>退款统计</h2>
            {refunds.length === 0 ? (
              <EmptyState description="暂无退款数据" title="退款统计" />
            ) : (
              <table className="sdkwork-mall-pc-table">
                <thead><tr><th>周期</th><th>退款金额</th><th>笔数</th></tr></thead>
                <tbody>
                  {refunds.map((row, index) => (
                    <tr key={`${row.period}-${index}`}>
                      <td>{row.period}</td>
                      <td>{row.amount}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
