import { Link } from "react-router-dom";
import { Clock, Gift, Shield, Star, Store, Ticket, TrendingUp } from "lucide-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";
import { useEffect, useState } from "react";
import { Badge, Button, EmptyState, LoadingBlock, Progress, Separator } from "@sdkwork/ui-pc-react";
import {
  readMallFavorites,
  readMallShopFavorites,
  removeMallFavorite,
  toggleMallShopFavorite,
} from "../favorites-service";

export function SdkworkMallFavoritesPage() {
  const [productItems, setProductItems] = useState(readMallFavorites());
  const [shopItems, setShopItems] = useState(readMallShopFavorites());

  return (
    <div>
      <h1>我的收藏</h1>
      <section>
        <h2>商品收藏</h2>
        {productItems.length === 0 ? (
          <EmptyState description="浏览商品时可加入收藏" title="暂无商品收藏" />
        ) : (
          <ul className="sdkwork-mall-pc-footprint-list">
            {productItems.map((item) => (
              <li key={item.id}>
                <Link to={`/product/${item.id}`}>{item.title}</Link>
                <Button
                  onClick={() => {
                    removeMallFavorite(item.id);
                    setProductItems(readMallFavorites());
                  }}
                  type="button"
                >
                  取消收藏
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2><Store aria-hidden="true" size={16} /> 关注店铺</h2>
        {shopItems.length === 0 ? (
          <EmptyState description="在店铺页可点击关注" title="暂无关注店铺" />
        ) : (
          <ul className="sdkwork-mall-pc-footprint-list">
            {shopItems.map((item) => (
              <li key={item.id}>
                <Link to={`/shop/${item.id}`}>{item.name}</Link>
                <Button
                  onClick={() => {
                    toggleMallShopFavorite(item);
                    setShopItems(readMallShopFavorites());
                  }}
                  type="button"
                >
                  取消关注
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p>收藏与关注数据暂存于本机浏览器，服务端同步需等待 commerce favorites API 合约落地。</p>
    </div>
  );
}

export function SdkworkMallSecurityPage() {
  const [accountLabel, setAccountLabel] = useState("账户");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const service = getSdkworkCommerceService();
        const response = await service.accounts.current.summary.retrieve({});
        const payload = unwrapSdkworkCommerceResponse(response) as Record<string, unknown>;
        if (active) {
          setAccountLabel(String(payload.displayName ?? payload.email ?? payload.phone ?? "账户"));
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
    return <LoadingBlock label="加载账户信息..." />;
  }

  return (
    <div className="sdkwork-mall-pc-security-page">
      <h1><Shield aria-hidden="true" size={20} /> 账户与安全</h1>
      <p>当前登录：{accountLabel}</p>
      <ul>
        <li><Link to="/auth/login">修改密码</Link></li>
        <li>手机号绑定与设备管理由 IAM 认证路由提供</li>
        <li>登录保护与风险校验遵循平台安全策略</li>
      </ul>
    </div>
  );
}

interface RecentOrder {
  id: string;
  title: string;
  status: string;
  totalCny?: number;
  createdAt?: string;
}

interface AvailableCoupon {
  id: string;
  title: string;
  discountText?: string;
  expiresAt?: string;
}

interface RecommendedActivity {
  id: string;
  title: string;
  description?: string;
  endAt?: string;
}

interface MembershipInfo {
  level?: string;
  growthValue?: number;
  nextLevel?: string;
  nextLevelGrowth?: number;
}

function formatCny(value: number | null | undefined): string {
  if (value == null) return "-";
  return `¥${value.toFixed(2)}`;
}

function formatDate(value: string | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: "待付款",
  pending_shipment: "待发货",
  pending_receipt: "待收货",
  completed: "已完成",
  cancelled: "已取消",
  after_sales: "售后中",
};

function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

function orderStatusBadgeVariant(status: string): "default" | "secondary" | "success" | "warning" | "danger" | "outline" {
  switch (status) {
    case "pending_payment":
      return "warning";
    case "pending_shipment":
    case "pending_receipt":
      return "default";
    case "completed":
      return "success";
    case "cancelled":
      return "secondary";
    case "after_sales":
      return "danger";
    default:
      return "outline";
  }
}

export function SdkworkMallBuyerDashboardPage() {
  const [pendingAfterSales, setPendingAfterSales] = useState(0);
  const [orderStats, setOrderStats] = useState({
    completed: 0,
    pendingPayment: 0,
    pendingReceipt: 0,
    pendingShipment: 0,
    totalOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [membership, setMembership] = useState<MembershipInfo>({});
  const [activities, setActivities] = useState<RecommendedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const service = getSdkworkCommerceService();
      const [
        afterSalesResult,
        statsResult,
        ordersResult,
        couponsResult,
        accountResult,
        offersResult,
      ] = await Promise.allSettled([
        service.afterSales.requests.list({ status: "pending", page: 1, page_size: 1 }),
        service.orders.statistics.retrieve(),
        service.orders.list({ page: 1, page_size: 5 }),
        service.promotions.userCoupons.wallet.list({ page: 1, page_size: 5 }),
        service.accounts.current.summary.retrieve({}),
        service.promotions.offers.list({ page: 1, page_size: 4 }),
      ]);
      if (!active) {
        return;
      }

      if (afterSalesResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(afterSalesResult.value) as { total?: number };
        setPendingAfterSales(payload.total ?? 0);
      }

      if (statsResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(statsResult.value) as Record<string, unknown>;
        setOrderStats({
          totalOrders: Number(payload.totalOrders ?? payload.total_orders ?? 0),
          pendingPayment: Number(payload.pendingPayment ?? payload.pending_payment ?? 0),
          pendingShipment: Number(payload.pendingShipment ?? payload.pending_shipment ?? 0),
          pendingReceipt: Number(payload.pendingReceipt ?? payload.pending_receipt ?? 0),
          completed: Number(payload.completed ?? 0),
        });
      }

      if (ordersResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(ordersResult.value) as { items?: Record<string, unknown>[] };
        setRecentOrders(
          payload.items?.map((item) => ({
            id: String(item.id ?? ""),
            title: String(item.subject ?? item.title ?? "订单"),
            status: String(item.status ?? ""),
            totalCny: typeof item.totalAmount === "number" ? item.totalAmount : typeof item.total === "number" ? item.total : undefined,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : typeof item.created_at === "string" ? item.created_at : undefined,
          })) ?? [],
        );
      }

      if (couponsResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(couponsResult.value) as { items?: Record<string, unknown>[] };
        setAvailableCoupons(
          payload.items?.map((item) => ({
            id: String(item.id ?? ""),
            title: String(item.title ?? item.name ?? "优惠券"),
            discountText: typeof item.discountText === "string" ? item.discountText : typeof item.discount === "string" ? item.discount : undefined,
            expiresAt: typeof item.expiresAt === "string" ? item.expiresAt : typeof item.endAt === "string" ? item.endAt : undefined,
          })) ?? [],
        );
      }

      if (accountResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(accountResult.value) as Record<string, unknown>;
        setMembership({
          level: typeof payload.membershipLevel === "string" ? payload.membershipLevel : typeof payload.level === "string" ? payload.level : undefined,
          growthValue: typeof payload.growthValue === "number" ? payload.growthValue : typeof payload.growth === "number" ? payload.growth : undefined,
          nextLevel: typeof payload.nextLevel === "string" ? payload.nextLevel : undefined,
          nextLevelGrowth: typeof payload.nextLevelGrowth === "number" ? payload.nextLevelGrowth : undefined,
        });
      }

      if (offersResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(offersResult.value) as { items?: Record<string, unknown>[] };
        setActivities(
          payload.items?.slice(0, 4).map((item) => ({
            id: String(item.id ?? ""),
            title: String(item.title ?? item.name ?? "活动"),
            description: typeof item.description === "string" ? item.description : undefined,
            endAt: typeof item.endAt === "string" ? item.endAt : typeof item.end_at === "string" ? item.end_at : undefined,
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
    return <LoadingBlock label="加载买家中心..." />;
  }

  const growthPercent = membership.growthValue != null && membership.nextLevelGrowth != null && membership.nextLevelGrowth > 0
    ? Math.min(100, Math.round((membership.growthValue / membership.nextLevelGrowth) * 100))
    : null;

  return (
    <div className="sdkwork-mall-pc-buyer-dashboard">
      <h1>买家中心</h1>

      {/* 订单状态统计 */}
      <div className="sdkwork-mall-pc-stat-grid">
        <Link to="/buyer/orders?status=pending_payment">
          <span>待付款</span><strong>{orderStats.pendingPayment}</strong>
        </Link>
        <Link to="/buyer/orders?status=pending_shipment">
          <span>待发货</span><strong>{orderStats.pendingShipment}</strong>
        </Link>
        <Link to="/buyer/orders?status=pending_receipt">
          <span>待收货</span><strong>{orderStats.pendingReceipt}</strong>
        </Link>
        <Link to="/buyer/orders?status=completed">
          <span>已完成</span><strong>{orderStats.completed}</strong>
        </Link>
        <Link to="/buyer/orders">
          <span>全部订单</span><strong>{orderStats.totalOrders}</strong>
        </Link>
        <Link to="/buyer/after-sales">
          <span>售后处理中</span><strong>{pendingAfterSales}</strong>
        </Link>
      </div>

      <div className="sdkwork-mall-pc-dashboard-grid">
        {/* 最近订单 */}
        <section className="sdkwork-mall-pc-dashboard-card">
          <div className="sdkwork-mall-pc-dashboard-card-header">
            <h2>最近订单</h2>
            <Link to="/buyer/orders">查看全部</Link>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState description="去逛逛吧" title="暂无订单" />
          ) : (
            <ul className="sdkwork-mall-pc-recent-orders">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link to={`/buyer/orders/${order.id}`} className="sdkwork-mall-pc-recent-order-item">
                    <div className="sdkwork-mall-pc-recent-order-info">
                      <span className="sdkwork-mall-pc-recent-order-title">{order.title}</span>
                      {order.createdAt ? (
                        <span className="sdkwork-mall-pc-recent-order-date">{formatDate(order.createdAt)}</span>
                      ) : null}
                    </div>
                    <div className="sdkwork-mall-pc-recent-order-meta">
                      {order.totalCny != null ? (
                        <span className="sdkwork-mall-pc-recent-order-amount">{formatCny(order.totalCny)}</span>
                      ) : null}
                      <Badge variant={orderStatusBadgeVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 可用优惠券 */}
        <section className="sdkwork-mall-pc-dashboard-card">
          <div className="sdkwork-mall-pc-dashboard-card-header">
            <h2><Ticket aria-hidden="true" size={16} /> 可用优惠券</h2>
            <Link to="/buyer/coupons">查看全部</Link>
          </div>
          {availableCoupons.length === 0 ? (
            <EmptyState description="领取优惠券后可在此查看" title="暂无可用优惠券" />
          ) : (
            <ul className="sdkwork-mall-pc-coupon-list">
              {availableCoupons.map((coupon) => (
                <li key={coupon.id} className="sdkwork-mall-pc-coupon-item">
                  <div className="sdkwork-mall-pc-coupon-info">
                    <span className="sdkwork-mall-pc-coupon-title">{coupon.title}</span>
                    {coupon.discountText ? (
                      <Badge variant="danger">{coupon.discountText}</Badge>
                    ) : null}
                  </div>
                  {coupon.expiresAt ? (
                    <span className="sdkwork-mall-pc-coupon-expires">
                      <Clock aria-hidden="true" size={12} />
                      {formatDate(coupon.expiresAt)}到期
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 会员等级 / 成长值 */}
        <section className="sdkwork-mall-pc-dashboard-card">
          <div className="sdkwork-mall-pc-dashboard-card-header">
            <h2>会员中心</h2>
            <Link to="/buyer/membership">查看详情</Link>
          </div>
          <div className="sdkwork-mall-pc-membership-info">
            <div className="sdkwork-mall-pc-membership-level-row">
              <span className="sdkwork-mall-pc-membership-level-label">当前等级</span>
              <Badge variant="default">{membership.level ?? "普通会员"}</Badge>
            </div>
            {membership.growthValue != null ? (
              <div className="sdkwork-mall-pc-membership-growth">
                <div className="sdkwork-mall-pc-membership-growth-header">
                  <span>成长值</span>
                  <span>{membership.growthValue}{membership.nextLevelGrowth != null ? ` / ${membership.nextLevelGrowth}` : ""}</span>
                </div>
                {growthPercent != null ? (
                  <Progress value={growthPercent} />
                ) : null}
                {membership.nextLevel ? (
                  <span className="sdkwork-mall-pc-membership-next-level">
                    距 {membership.nextLevel} 还需 {Math.max(0, (membership.nextLevelGrowth ?? 0) - membership.growthValue)} 成长值
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* 推荐活动 */}
        <section className="sdkwork-mall-pc-dashboard-card">
          <div className="sdkwork-mall-pc-dashboard-card-header">
            <h2><TrendingUp aria-hidden="true" size={16} /> 推荐活动</h2>
            <Link to="/activity">更多活动</Link>
          </div>
          {activities.length === 0 ? (
            <EmptyState description="敬请期待" title="暂无推荐活动" />
          ) : (
            <ul className="sdkwork-mall-pc-activity-recommend-list">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <Link to={`/activity/${activity.id}`} className="sdkwork-mall-pc-activity-recommend-item">
                    <div className="sdkwork-mall-pc-activity-recommend-info">
                      <span className="sdkwork-mall-pc-activity-recommend-title">{activity.title}</span>
                      {activity.description ? (
                        <span className="sdkwork-mall-pc-activity-recommend-desc">{activity.description}</span>
                      ) : null}
                    </div>
                    {activity.endAt ? (
                      <span className="sdkwork-mall-pc-activity-recommend-end">
                        <Clock aria-hidden="true" size={12} />
                        {formatDate(activity.endAt)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Separator />

      {/* 常用功能入口 */}
      <div className="sdkwork-mall-pc-quick-links">
        <Link to="/buyer/orders">我的订单</Link>
        <Link to="/buyer/after-sales">售后服务</Link>
        <Link to="/buyer/addresses">收货地址</Link>
        <Link to="/buyer/wallet">我的钱包</Link>
        <Link to="/buyer/points">积分中心</Link>
        <Link to="/buyer/coupons">优惠券</Link>
        <Link to="/buyer/invoices">发票管理</Link>
        <Link to="/buyer/favorites">我的收藏</Link>
        <Link to="/buyer/footprint">浏览足迹</Link>
        <Link to="/buyer/membership">会员中心</Link>
        <Link to="/buyer/reviews"><Star aria-hidden="true" size={14} /> 我的评价</Link>
        <Link to="/buyer/messages">消息中心</Link>
        <Link to="/buyer/profile">个人资料</Link>
        <Link to="/buyer/security">账户安全</Link>
        <Link to="/buyer/gift-cards"><Gift aria-hidden="true" size={14} /> 礼品卡</Link>
      </div>
    </div>
  );
}

export function SdkworkMallProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const service = getSdkworkCommerceService();
        const response = await service.accounts.current.summary.retrieve({});
        if (active) {
          setProfile(unwrapSdkworkCommerceResponse(response) as Record<string, unknown>);
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
    return <LoadingBlock label="加载个人资料..." />;
  }

  return (
    <div className="sdkwork-mall-pc-profile-page">
      <h1>个人资料</h1>
      <dl className="sdkwork-mall-pc-profile-list">
        <div><dt>昵称</dt><dd>{String(profile?.displayName ?? "-")}</dd></div>
        <div><dt>邮箱</dt><dd>{String(profile?.email ?? "-")}</dd></div>
        <div><dt>手机号</dt><dd>{String(profile?.phone ?? "-")}</dd></div>
        <div><dt>会员等级</dt><dd>{String(profile?.membershipLevel ?? profile?.level ?? "-")}</dd></div>
      </dl>
      <p>头像与实名认证等扩展资料由 IAM 账户中心提供。</p>
      <Link to="/buyer/security">前往账户安全</Link>
    </div>
  );
}

export function SdkworkMallGiftCardsPage() {
  return (
    <div className="sdkwork-mall-pc-gift-cards-page">
      <h1><Gift aria-hidden="true" size={20} /> 礼品卡与红包</h1>
      <EmptyState
        description="礼品卡购买、赠送、兑换与红包领取需 commerce gift-cards API"
        title="礼品卡功能待 SDK 合约"
      />
      <p>
        当前版本仅预留路由与页面占位。待 `@sdkwork/commerce-service` 提供 gift-cards / red-packet
        相关方法后，将在此接入余额、领取记录与兑换流程。
      </p>
      <Link to="/buyer/wallet">查看我的钱包</Link>
    </div>
  );
}
