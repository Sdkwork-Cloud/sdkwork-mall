import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { LoadingBlock } from "@sdkwork/ui-pc-react";
import { loadMallBuyerAccountSummary } from "../buyer-hub-service";

export function SdkworkMallProfilePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const summary = await loadMallBuyerAccountSummary();
        if (active) {
          setProfile(summary);
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
