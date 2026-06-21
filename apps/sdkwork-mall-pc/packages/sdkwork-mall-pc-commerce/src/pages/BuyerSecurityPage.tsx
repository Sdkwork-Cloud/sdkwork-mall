import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import {
  getSdkworkCommerceService,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";
import { useEffect, useState } from "react";
import { LoadingBlock } from "@sdkwork/ui-pc-react";

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
