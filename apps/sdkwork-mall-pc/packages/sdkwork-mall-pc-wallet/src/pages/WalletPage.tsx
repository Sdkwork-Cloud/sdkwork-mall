import { useEffect } from "react";
import {
  LoadingBlock,
  StatusNotice,
} from "@sdkwork/ui-pc-react";
import type { SdkworkWalletMessagesOverrides } from "../wallet-copy";
import type { SdkworkWalletController } from "../wallet-controller";
import {
  useSdkworkWalletController,
  useSdkworkWalletControllerState,
} from "../wallet-controller";
import { createSdkworkWalletBackdropStyle } from "../wallet-appearance";
import {
  SdkworkWalletIntlProvider,
  useSdkworkWalletIntl,
} from "../wallet-intl";
import { SdkworkWalletBalancePanel } from "../components/wallet-balance-panel";
import { SdkworkWalletRechargeDialog } from "../components/wallet-recharge-dialog";
import { SdkworkWalletSummaryCards } from "../components/wallet-summary-cards";
import { SdkworkWalletTransactionList } from "../components/wallet-transaction-list";
import { SdkworkWalletWithdrawDialog } from "../components/wallet-withdraw-dialog";

export interface SdkworkWalletPageProps {
  controller?: SdkworkWalletController;
  locale?: string | null;
  messages?: SdkworkWalletMessagesOverrides;
}

interface SdkworkWalletPageContentProps {
  controller?: SdkworkWalletController;
}

function SdkworkWalletPageContent({
  controller: controllerProp,
}: SdkworkWalletPageContentProps) {
  const controller = useSdkworkWalletController(controllerProp);
  const state = useSdkworkWalletControllerState(controller);
  const { copy } = useSdkworkWalletIntl();

  useEffect(() => {
    if (!state.isBootstrapped && !state.isLoading) {
      void controller.bootstrap();
    }
  }, [controller, state.isBootstrapped, state.isLoading]);

  return (
    <div className="relative h-full overflow-y-auto">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={createSdkworkWalletBackdropStyle()}
      />

      <div className="relative px-4 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-[88rem] space-y-5">
          <SdkworkWalletBalancePanel
            onOpenRecharge={() => controller.openRecharge()}
            onOpenWithdraw={() => controller.openWithdraw()}
            overview={state.overview}
          />

          <SdkworkWalletSummaryCards overview={state.overview} />

          {state.isLoading && !state.isBootstrapped ? <LoadingBlock label={copy.page.loading} /> : null}

          {state.lastError ? (
            <StatusNotice title={copy.page.errorTitle} tone="danger">
              {state.lastError}
            </StatusNotice>
          ) : null}

          <SdkworkWalletTransactionList transactions={state.overview.transactions} />
        </div>

        <SdkworkWalletRechargeDialog
          controller={controller}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeRecharge();
            }
          }}
          open={state.isRechargeOpen}
        />
        <SdkworkWalletWithdrawDialog
          controller={controller}
          onOpenChange={(open) => {
            if (!open) {
              controller.closeWithdraw();
            }
          }}
          open={state.isWithdrawOpen}
        />
      </div>
    </div>
  );
}

export function SdkworkWalletPage({
  locale,
  messages,
  ...props
}: SdkworkWalletPageProps) {
  const content = <SdkworkWalletPageContent {...props} />;

  if (locale || messages) {
    return (
      <SdkworkWalletIntlProvider locale={locale} messages={messages}>
        {content}
      </SdkworkWalletIntlProvider>
    );
  }

  return content;
}
