import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, EmptyState, LoadingBlock } from "@sdkwork/ui-pc-react";

import { clearMallFootprint, readMallFootprint } from "../footprint-service";
import { loadMallPendingReviewOrders } from "../reviews-service";

export function SdkworkMallReviewsPage() {
  const [pending, setPending] = useState<Array<{ id: string; status: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const rows = await loadMallPendingReviewOrders();
        if (active) {
          setPending(rows);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingBlock label="加载评价..." />;
  }

  return (
    <div className="sdkwork-mall-pc-reviews-page">
      <h1>我的评价</h1>
      <section>
        <h2>待评价</h2>
        {pending.length === 0 ? (
          <EmptyState description="已完成订单可在此提交评价" title="暂无待评价订单" />
        ) : (
          <ul>
            {pending.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span> 订单号：{item.id}</span>
                <Link to="/buyer/orders">查看订单</Link>
                <Link to={`/buyer/after-sales?orderId=${encodeURIComponent(item.id)}`}>申请售后</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p>商品晒单与媒体上传需等待 T1 商品评价 API 合约落地。</p>
    </div>
  );
}

export function SdkworkMallFootprintPage() {
  const [items, setItems] = useState<Array<{ id: string; title: string; viewedAt: string }>>([]);

  useEffect(() => {
    setItems(readMallFootprint());
  }, []);

  return (
    <div className="sdkwork-mall-pc-footprint-page">
      <header className="sdkwork-mall-pc-page-header">
        <h1>浏览足迹</h1>
        {items.length > 0 ? (
          <Button
            onClick={() => {
              clearMallFootprint();
              setItems([]);
            }}
            type="button"
          >
            清空
          </Button>
        ) : null}
      </header>
      {items.length === 0 ? (
        <EmptyState description="浏览过的商品会出现在这里" title="暂无足迹" />
      ) : (
        <ul className="sdkwork-mall-pc-footprint-list">
          {items.map((item) => (
            <li key={`${item.id}-${item.viewedAt}`}>
              <Link to={`/product/${item.id}`}>{item.title}</Link>
              <span>{new Date(item.viewedAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      <p>浏览足迹暂存于本机浏览器，服务端同步需等待 T1 footprint API 合约落地。</p>
    </div>
  );
}
