import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  ReceiptText,
  Truck,
} from "lucide-react";
import { StatCard } from "@sdkwork/ui-pc-react";
import type { SdkworkOrderStatistics } from "../order-service";
import { useSdkworkOrderIntl } from "../order-intl";

export interface SdkworkOrderStatGridProps {
  statistics: SdkworkOrderStatistics;
}

export function SdkworkOrderStatGrid({
  statistics,
}: SdkworkOrderStatGridProps) {
  const { copy } = useSdkworkOrderIntl();

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        icon={<ReceiptText className="h-5 w-5" />}
        label={copy.stats.totalOrders}
        value={String(statistics.totalOrders)}
      />
      <StatCard
        changeTone="warning"
        icon={<Clock3 className="h-5 w-5" />}
        label={copy.stats.pendingPayment}
        value={String(statistics.pendingPayment)}
      />
      <StatCard
        changeTone="default"
        icon={<Truck className="h-5 w-5" />}
        label={copy.stats.pendingShipment}
        value={String(statistics.pendingShipment)}
      />
      <StatCard
        changeTone="default"
        icon={<PackageCheck className="h-5 w-5" />}
        label={copy.stats.pendingReceipt}
        value={String(statistics.pendingReceipt)}
      />
      <StatCard
        changeTone="success"
        icon={<CheckCircle2 className="h-5 w-5" />}
        label={copy.stats.completed}
        value={String(statistics.completed)}
      />
    </div>
  );
}
