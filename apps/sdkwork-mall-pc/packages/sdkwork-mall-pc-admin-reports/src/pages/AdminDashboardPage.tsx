import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingBlock } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

export function SdkworkMallAdminDashboardPage() {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const service = getSdkworkCommerceService();
        const response = await service.admin.reports.commerceOverview.retrieve({});
        if (active) {
          setOverview(unwrapSdkworkCommerceResponse(response) as Record<string, unknown>);
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
    return <LoadingBlock label="加载管理后台..." />;
  }

  return (
    <div>
      <h1>平台总览</h1>
      <div className="sdkwork-mall-pc-stat-grid">
        <article><span>GMV</span><strong>{String(overview?.gmv ?? "-")}</strong></article>
        <article><span>订单数</span><strong>{String(overview?.orderCount ?? "-")}</strong></article>
        <article><span>新增用户</span><strong>{String(overview?.newUsers ?? "-")}</strong></article>
        <article><span>待审核</span><strong>{String(overview?.pendingReview ?? "-")}</strong></article>
      </div>
      <nav className="sdkwork-mall-pc-quick-links">
        <Link to="/admin/shops">商家管理</Link>
        <Link to="/admin/users">用户中心</Link>
        <Link to="/admin/brands">品牌中心</Link>
        <Link to="/admin/products">商品治理</Link>
        <Link to="/admin/orders">订单监管</Link>
        <Link to="/admin/after-sales">售后监管</Link>
        <Link to="/admin/marketing">营销管理</Link>
        <Link to="/admin/cms">内容 CMS</Link>
        <Link to="/admin/reports">数据报表</Link>
        <Link to="/admin/audit">审计日志</Link>
        <Link to="/admin/risk">风控中心</Link>
        <Link to="/admin/moderation">举报处罚</Link>
        <Link to="/admin/settlement">财务结算</Link>
        <Link to="/admin/permissions">权限管理</Link>
      </nav>
    </div>
  );
}
