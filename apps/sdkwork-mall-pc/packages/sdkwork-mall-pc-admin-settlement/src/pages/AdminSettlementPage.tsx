import { useEffect, useState } from "react";
import { Button, EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";
import { getSdkworkAdminRemotePort } from "@sdkwork/mall-pc-admin-core/admin-remote-port";

interface SettlementShopRow {
  id: string;
  name: string;
  profileStatus: string;
}

export function SdkworkMallAdminSettlementPage() {
  const [revenue, setRevenue] = useState<Array<{ amount: string; period: string }>>([]);
  const [refunds, setRefunds] = useState<Array<{ amount: string; period: string }>>([]);
  const [deposits, setDeposits] = useState<Array<{ paid: string; required: string; shopName: string }>>([]);
  const [profiles, setProfiles] = useState<SettlementShopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyShopId, setBusyShopId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const service = getSdkworkAdminRemotePort();
      const [revenueResult, refundsResult, shopsResult] = await Promise.allSettled([
        service.admin.commerceReports.orderRevenue.list({ page: 1, page_size: 5 }),
        service.admin.commerceReports.refunds.list({ page: 1, page_size: 5 }),
        service.admin.shops.management.list({ page: 1, page_size: 5 }),
      ]);

      if (revenueResult.status === "fulfilled") {
        const payload = unwrapSdkworkPaymentResponse(revenueResult.value) as { items?: Record<string, unknown>[] };
        setRevenue(
          payload.items?.map((item) => ({
            period: String(item.period ?? item.date ?? "-"),
            amount: String(item.amount ?? item.revenue ?? "-"),
          })) ?? [],
        );
      }

      if (refundsResult.status === "fulfilled") {
        const payload = unwrapSdkworkPaymentResponse(refundsResult.value) as { items?: Record<string, unknown>[] };
        setRefunds(
          payload.items?.map((item) => ({
            period: String(item.period ?? item.date ?? "-"),
            amount: String(item.amount ?? item.refundAmount ?? "-"),
          })) ?? [],
        );
      }

      if (shopsResult.status === "fulfilled") {
        const payload = unwrapSdkworkPaymentResponse(shopsResult.value) as { items?: Record<string, unknown>[] };
        const depositRows: Array<{ paid: string; required: string; shopName: string }> = [];
        const profileRows: SettlementShopRow[] = [];

        for (const shop of payload.items ?? []) {
          const shopId = String(shop.id ?? "");
          if (!shopId) {
            continue;
          }

          profileRows.push({
            id: shopId,
            name: String(shop.name ?? shop.title ?? shopId),
            profileStatus: String(shop.settlementProfileStatus ?? "pending"),
          });

          try {
            const depositResponse = await service.admin.shops.depositAccount.retrieve({ shopId });
            const deposit = unwrapSdkworkPaymentResponse(depositResponse) as Record<string, unknown>;
            depositRows.push({
              shopName: String(shop.name ?? shop.title ?? shopId),
              required: String(deposit.requiredAmount ?? "-"),
              paid: String(deposit.paidAmount ?? "-"),
            });
          } catch {
            depositRows.push({
              shopName: String(shop.name ?? shop.title ?? shopId),
              required: "-",
              paid: "-",
            });
          }
        }

        setDeposits(depositRows);
        setProfiles(profileRows);
      }

      if (active) {
        setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function approveSettlementProfile(shopId: string) {
    setBusyShopId(shopId);
    try {
      const service = getSdkworkAdminRemotePort();
      await service.admin.shops.settlementProfile.approve(shopId, {});
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === shopId ? { ...profile, profileStatus: "approved" } : profile,
        ),
      );
    } finally {
      setBusyShopId(null);
    }
  }

  if (loading) {
    return <LoadingBlock label="加载结算数据..." />;
  }

  return (
    <div className="sdkwork-mall-pc-settlement-admin">
      <h1>财务结算</h1>

      <section>
        <h2>订单收入</h2>
        {revenue.length === 0 ? (
          <EmptyState description="收入报表将在此展示" title="暂无收入数据" />
        ) : (
          <table className="sdkwork-mall-pc-table">
            <thead>
              <tr>
                <th>周期</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((row, index) => (
                <tr key={`${row.period}-${index}`}>
                  <td>{row.period}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>退款对账</h2>
        <table className="sdkwork-mall-pc-table">
          <thead>
            <tr>
              <th>周期</th>
              <th>退款</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((row, index) => (
              <tr key={`${row.period}-${index}`}>
                <td>{row.period}</td>
                <td>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>商家保证金</h2>
        <table className="sdkwork-mall-pc-table">
          <thead>
            <tr>
              <th>店铺</th>
              <th>应缴</th>
              <th>已缴</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((row) => (
              <tr key={row.shopName}>
                <td>{row.shopName}</td>
                <td>{row.required}</td>
                <td>{row.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>结算资料审核</h2>
        <table className="sdkwork-mall-pc-table">
          <thead>
            <tr>
              <th>店铺</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.name}</td>
                <td>{profile.profileStatus}</td>
                <td>
                  {profile.profileStatus !== "approved" ? (
                    <Button
                      disabled={busyShopId === profile.id}
                      onClick={() => void approveSettlementProfile(profile.id)}
                      type="button"
                    >
                      审核通过
                    </Button>
                  ) : (
                    "已通过"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
