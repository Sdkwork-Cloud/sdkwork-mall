import { Link } from "react-router-dom";
import {
  Button,
  DetailDrawer,
  DetailDrawerMetric,
  DetailDrawerMetrics,
  DetailDrawerSection,
} from "@sdkwork/ui-pc-react";
import type { SdkworkOrderController } from "../order-controller";
import { useSdkworkOrderControllerState } from "../order-controller";
import { useSdkworkOrderIntl } from "../order-intl";

export interface SdkworkOrderDetailDrawerProps {
  controller: SdkworkOrderController;
}

export function SdkworkOrderDetailDrawer({
  controller,
}: SdkworkOrderDetailDrawerProps) {
  const state = useSdkworkOrderControllerState(controller);
  const detail = state.detail;
  const {
    copy,
    formatCurrencyCny,
    formatDetailSummary,
    formatItemMeta,
    formatPaymentMethod,
    formatStatus,
    formatTimelineLabel,
    formatTimestamp,
  } = useSdkworkOrderIntl();

  const canPay = detail?.status === "pending-payment";
  const canCancel = detail?.status === "pending-payment";
  const canAfterSales = detail?.status === "paid" || detail?.status === "completed";

  return (
    <DetailDrawer
      description={detail?.subject || copy.detail.description}
      footer={(
        <div className="flex flex-wrap justify-end gap-3">
          {canAfterSales && detail ? (
            <Link className="sdkwork-mall-pc-link-button" to={`/buyer/after-sales?orderId=${encodeURIComponent(detail.id)}`}>
              申请售后
            </Link>
          ) : null}
          {canPay && detail ? (
            <Button
              disabled={state.isMutating}
              onClick={() => void controller.payOrder({ orderId: detail.id })}
              type="button"
            >
              去支付
            </Button>
          ) : null}
          {canCancel && detail ? (
            <Button
              disabled={state.isMutating}
              onClick={() => void controller.cancelOrder({ orderId: detail.id, cancelReason: "buyer-cancel" })}
              type="button"
              variant="outline"
            >
              取消订单
            </Button>
          ) : null}
          <Button onClick={() => controller.closeDetail()} type="button" variant="ghost">
            {copy.actions.close}
          </Button>
        </div>
      )}
      onOpenChange={(open) => {
        if (!open) {
          controller.closeDetail();
        }
      }}
      open={state.isDetailOpen}
      summary={detail ? formatDetailSummary(detail.id) : copy.detail.loading}
      title={copy.detail.title}
    >
      {state.isDetailLoading || !detail ? (
        <div className="text-sm text-[var(--sdk-color-text-secondary)]">{copy.detail.loading}</div>
      ) : (
        <>
          <DetailDrawerMetrics columns={3}>
            <DetailDrawerMetric label={copy.detail.totalAmount} value={formatCurrencyCny(detail.totalAmountCny)} />
            <DetailDrawerMetric label={copy.detail.paidAmount} value={formatCurrencyCny(detail.paidAmountCny)} />
            <DetailDrawerMetric
              label={copy.detail.status}
              tone={detail.status === "pending-payment" ? "warning" : "default"}
              value={formatStatus(detail.status, detail.statusLabel)}
            />
          </DetailDrawerMetrics>

          <DetailDrawerSection description={copy.overview.description} title={copy.overview.title}>
            <div className="grid gap-3 text-sm text-[var(--sdk-color-text-secondary)] sm:grid-cols-2">
              <div>{copy.overview.orderSn}: {detail.orderSn || copy.common.emptyValue}</div>
              <div>{copy.overview.outTradeNo}: {detail.outTradeNo || copy.common.emptyValue}</div>
              <div>{copy.overview.paymentMethod}: {formatPaymentMethod(detail.paymentMethod)}</div>
              <div>{copy.overview.transactionId}: {detail.transactionId || copy.common.emptyValue}</div>
              <div>{copy.overview.createdAt}: {formatTimestamp(detail.createdAt)}</div>
              <div>{copy.overview.paidAt}: {formatTimestamp(detail.payTime)}</div>
            </div>
          </DetailDrawerSection>

          <DetailDrawerSection description={copy.items.description} title={copy.items.title}>
            <div className="space-y-3">
              {detail.items.length === 0 ? (
                <div className="text-sm text-[var(--sdk-color-text-secondary)]">{copy.items.empty}</div>
              ) : detail.items.map((item) => (
                <div
                  className="rounded-[1rem] border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel-muted)] px-4 py-3"
                  key={item.id}
                >
                  <div className="text-sm font-semibold text-[var(--sdk-color-text-primary)]">{item.name}</div>
                  <div className="mt-1 text-sm text-[var(--sdk-color-text-secondary)]">
                    {formatItemMeta(item.quantity, item.totalAmountCny)}
                  </div>
                </div>
              ))}
            </div>
          </DetailDrawerSection>

          <DetailDrawerSection description={copy.timeline.description} title={copy.timeline.title}>
            <div className="space-y-3">
              {detail.timeline.length === 0 ? (
                <div className="text-sm text-[var(--sdk-color-text-secondary)]">{copy.timeline.empty}</div>
              ) : detail.timeline.map((event, index) => (
                <div
                  className="rounded-[1rem] border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel-muted)] px-4 py-3"
                  key={`${event.label}-${index}`}
                >
                  <div className="text-sm font-semibold text-[var(--sdk-color-text-primary)]">{formatTimelineLabel(event.label)}</div>
                  <div className="mt-1 text-sm text-[var(--sdk-color-text-secondary)]">
                    {formatTimestamp(event.occurredAt)}
                  </div>
                </div>
              ))}
            </div>
          </DetailDrawerSection>
        </>
      )}
    </DetailDrawer>
  );
}
