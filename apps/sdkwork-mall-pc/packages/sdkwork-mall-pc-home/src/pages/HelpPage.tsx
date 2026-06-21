import { Link } from "react-router-dom";

const helpSections = [
  {
    title: "订单与物流",
    items: [
      "在买家中心「我的订单」查看订单状态与物流信息",
      "未发货前可联系客服尝试修改收货地址",
      "支付成功后可在「支付结果」页查看支付单号",
    ],
  },
  {
    title: "售后服务",
    items: [
      "已完成订单可在「我的评价」查看待评价商品",
      "在「售后中心」发起退款、退货或换货申请",
      "售后进度同步至「消息中心」",
    ],
  },
  {
    title: "发票与资产",
    items: [
      "「发票管理」申请电子/纸质发票",
      "「优惠券」「积分」「我的钱包」统一管理优惠资产",
      "「礼品卡」页面预留红包与礼品卡入口（待 SDK）",
      "会员权益在「会员中心」查看与续费",
    ],
  },
  {
    title: "账户安全",
    items: [
      "通过 IAM 认证路由修改密码与绑定手机",
      "「账户安全」查看当前登录账户信息",
      "异常登录请及时修改密码并联系平台客服",
    ],
  },
] as const;

export function SdkworkMallHelpPage() {
  return (
    <div className="sdkwork-mall-pc-help">
      <h1>帮助中心</h1>
      <p>常见问题与自助服务入口</p>

      <section className="sdkwork-mall-pc-quick-links">
        <Link to="/buyer/orders">订单查询</Link>
        <Link to="/buyer/after-sales">售后服务</Link>
        <Link to="/buyer/invoices">发票开具</Link>
        <Link to="/buyer/messages">消息通知</Link>
        <Link to="/buyer/gift-cards">礼品卡</Link>
        <Link to="/buyer/security">账户安全</Link>
        <Link to="/merchant/onboarding">商家入驻</Link>
      </section>

      {helpSections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h2>联系客服</h2>
        <ul>
          <li>在线客服：工作日 9:00–22:00</li>
          <li>商家合作：请前往 <Link to="/merchant/onboarding">商家入驻申请</Link></li>
        </ul>
      </section>
    </div>
  );
}
