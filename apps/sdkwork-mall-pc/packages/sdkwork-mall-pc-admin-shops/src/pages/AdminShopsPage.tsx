import { useEffect, useMemo, useState } from "react";
import { Button, EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

interface ShopRow {
  id: string;
  name: string;
  operationStatus: string;
  reviewStatus: string;
}

type ShopFilter = "all" | "pending" | "active";

function matchesShopFilter(shop: ShopRow, filter: ShopFilter): boolean {
  if (filter === "all") {
    return true;
  }
  const review = shop.reviewStatus.toLowerCase();
  const operation = shop.operationStatus.toLowerCase();
  if (filter === "pending") {
    return review.includes("pending") || review.includes("review") || review === "unknown";
  }
  return operation.includes("active") || operation.includes("open") || review.includes("approved");
}

export function SdkworkMallAdminShopsPage() {
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [loading, setLoading] = useState(true);
  const [busyShopId, setBusyShopId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopDetail, setShopDetail] = useState<Record<string, unknown> | null>(null);

  const filteredShops = useMemo(
    () => shops.filter((shop) => matchesShopFilter(shop, filter)),
    [filter, shops],
  );

  async function refresh() {
    setLoading(true);
    const service = getSdkworkCommerceService();
    const response = await service.admin.shops.management.list({ page: 1, page_size: 20 });
    const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
    setShops(
      payload.items?.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? item.shopName ?? item.title ?? "店铺"),
        reviewStatus: String(item.reviewStatus ?? item.review_status ?? "unknown"),
        operationStatus: String(item.operationStatus ?? item.operation_status ?? "unknown"),
      })) ?? [],
    );
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!selectedShopId) {
      setShopDetail(null);
      return;
    }
    let active = true;
    async function loadDetail() {
      const service = getSdkworkCommerceService();
      const response = await service.admin.shops.management.retrieve(selectedShopId!);
      if (active) {
        setShopDetail(unwrapSdkworkCommerceResponse(response) as Record<string, unknown>);
      }
    }
    void loadDetail();
    return () => {
      active = false;
    };
  }, [selectedShopId]);

  async function mutateShop(shopId: string, action: "approve" | "suspend") {
    setBusyShopId(shopId);
    try {
      const service = getSdkworkCommerceService();
      if (action === "approve") {
        await service.admin.shops.approve(shopId, {});
      } else {
        await service.admin.shops.suspend(shopId, { reason: "platform_review" });
      }
      await refresh();
    } finally {
      setBusyShopId(null);
    }
  }

  if (loading) {
    return <LoadingBlock label="加载商家..." />;
  }

  return (
    <div>
      <h1>商家管理</h1>
      <nav className="sdkwork-mall-pc-chip-row">
        <button onClick={() => setFilter("all")} type="button">全部</button>
        <button onClick={() => setFilter("pending")} type="button">待审核</button>
        <button onClick={() => setFilter("active")} type="button">经营中</button>
      </nav>

      {filteredShops.length === 0 ? (
        <EmptyState description="审核入驻申请后将在此展示" title="暂无商家" />
      ) : (
        <table className="sdkwork-mall-pc-table">
          <thead>
            <tr>
              <th>店铺</th>
              <th>审核状态</th>
              <th>经营状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.map((shop) => (
              <tr key={shop.id}>
                <td>
                  <button onClick={() => setSelectedShopId(shop.id)} type="button">
                    {shop.name}
                  </button>
                </td>
                <td>{shop.reviewStatus}</td>
                <td>{shop.operationStatus}</td>
                <td className="sdkwork-mall-pc-table-actions">
                  <Button disabled={busyShopId === shop.id} onClick={() => void mutateShop(shop.id, "approve")} type="button">
                    通过
                  </Button>
                  <Button disabled={busyShopId === shop.id} onClick={() => void mutateShop(shop.id, "suspend")} type="button">
                    暂停
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedShopId && shopDetail ? (
        <section className="sdkwork-mall-pc-form-grid">
          <h2>店铺详情</h2>
          <p>店铺 ID：{selectedShopId}</p>
          <p>名称：{String(shopDetail.name ?? shopDetail.shopName ?? "-")}</p>
          <p>联系人：{String(shopDetail.contactName ?? shopDetail.ownerName ?? "-")}</p>
          <p>状态：{String(shopDetail.status ?? shopDetail.operationStatus ?? "-")}</p>
        </section>
      ) : null}
    </div>
  );
}
