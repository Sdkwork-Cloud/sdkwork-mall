import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import { unwrapSdkworkPaymentResponse } from "@sdkwork/payment-service";
import { getSdkworkAdminRemotePort } from "@sdkwork/mall-pc-admin-core/admin-remote-port";
import { MALL_CMS_OFFER_MARKER } from "@sdkwork/mall-pc-cms/cms-service";

interface MallCampaignRow {
  id: string;
  status: string;
  title: string;
}

function isCmsConfigOffer(item: Record<string, unknown>): boolean {
  const marker = [item.code, item.offerCode, item.offer_code, item.title, item.name]
    .map((value) => String(value ?? ""))
    .join(" ")
    .toLowerCase();
  return marker.includes(MALL_CMS_OFFER_MARKER);
}

export function SdkworkMallAdminMarketingPage() {
  const [offers, setOffers] = useState<MallCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const service = getSdkworkAdminRemotePort();
    const response = await service.admin.promotions.offers.management.list({ page: 1, page_size: 50 });
    const payload = unwrapSdkworkPaymentResponse(response) as { items?: Record<string, unknown>[] };
    setOffers(
      payload.items
        ?.filter((item) => !isCmsConfigOffer(item))
        .map((item) => ({
          id: String(item.id ?? ""),
          title: String(item.title ?? item.name ?? "活动"),
          status: String(item.status ?? "draft"),
        })) ?? [],
    );
  }, []);

  useEffect(() => {
    let active = true;
    reload()
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reload]);

  async function handleCreate() {
    if (!title.trim()) {
      setMessage("请填写活动名称");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const service = getSdkworkAdminRemotePort();
      await service.admin.promotions.offers.create({
        code: code.trim() || undefined,
        description: "平台营销活动",
        status: "draft",
        title: title.trim(),
      });
      setTitle("");
      setCode("");
      setMessage("活动草稿已创建");
      await reload();
    } catch {
      setMessage("创建失败，请检查后台 API 与权限");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="加载营销活动..." />;
  }

  return (
    <div className="sdkwork-mall-pc-admin-marketing">
      <header className="sdkwork-mall-pc-page-header">
        <div>
          <h1>营销平台</h1>
          <p>平台券、跨店促销、秒杀会场与首页资源位</p>
        </div>
      </header>

      <section className="sdkwork-mall-pc-form-grid">
        <h2>新建活动</h2>
        <label>
          活动名称
          <input onChange={(event) => setTitle(event.target.value)} value={title} />
        </label>
        <label>
          活动编码（可选）
          <input onChange={(event) => setCode(event.target.value)} placeholder="例如 SPRING_SALE" value={code} />
        </label>
        <Button disabled={busy} onClick={() => void handleCreate()} type="button">
          创建草稿
        </Button>
        {message ? <p>{message}</p> : null}
      </section>

      <section>
        <h2>活动列表</h2>
        {offers.length === 0 ? (
          <EmptyState description="在此创建平台级营销活动" title="暂无活动" />
        ) : (
          <table className="sdkwork-mall-pc-table">
            <thead>
              <tr>
                <th>活动</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.title}</td>
                  <td>{offer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
