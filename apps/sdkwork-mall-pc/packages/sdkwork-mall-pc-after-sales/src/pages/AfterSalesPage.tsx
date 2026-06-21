import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, EmptyState, LoadingBlock, StatusNotice } from "@sdkwork/ui-pc-react";
import {
  getSdkworkCommerceService,
  formatSdkworkCommerceCurrencyCny,
  unwrapSdkworkCommerceResponse,
} from "@sdkwork/commerce-service";

type AfterSalesType = "exchange" | "maintenance" | "refund" | "resend" | "return";

type AfterSalesStatus =
  | "approved"
  | "cancelled"
  | "completed"
  | "pending"
  | "rejected"
  | "reviewing";

interface AfterSalesRow {
  createdAt?: string;
  id: string;
  orderId?: string;
  reason?: string;
  requestedAmountCny?: number | null;
  status: AfterSalesStatus;
  statusLabel: string;
  type: AfterSalesType;
  typeLabel: string;
}

interface EvidenceFile {
  id: string;
  name: string;
  previewUrl?: string;
  size: number;
}

interface AfterSalesFormState {
  description: string;
  evidenceFiles: EvidenceFile[];
  orderId: string;
  reason: string;
  requestedAmountCny: string;
  requestType: AfterSalesType;
}

interface AfterSalesFormErrors {
  description?: string;
  orderId?: string;
  reason?: string;
  requestedAmountCny?: string;
}

const AFTER_SALES_TYPES: Array<{ label: string; value: AfterSalesType; description: string }> = [
  { description: "商品未发货，申请退款", label: "仅退款", value: "refund" },
  { description: "已收货，退回商品并获得退款", label: "退货退款", value: "return" },
  { description: "更换同款商品（颜色/尺码等）", label: "换货", value: "exchange" },
  { description: "商家重新发货（无需退回原商品）", label: "补发", value: "resend" },
  { description: "商品质量问题，申请维修", label: "维修", value: "maintenance" },
];

const STATUS_LABELS: Record<AfterSalesStatus, string> = {
  approved: "已通过",
  cancelled: "已撤销",
  completed: "已完成",
  pending: "待审核",
  rejected: "已拒绝",
  reviewing: "审核中",
};

const STATUS_TONES: Record<AfterSalesStatus, string> = {
  approved: "text-[var(--sdk-color-state-success)] bg-[var(--sdk-color-state-success)]/10 border-[var(--sdk-color-state-success)]/30",
  cancelled: "text-[var(--sdk-color-text-muted)] bg-[var(--sdk-color-surface-subtle)] border-[var(--sdk-color-border-default)]",
  completed: "text-[var(--sdk-color-state-success)] bg-[var(--sdk-color-state-success)]/10 border-[var(--sdk-color-state-success)]/30",
  pending: "text-[var(--sdk-color-state-warning)] bg-[var(--sdk-color-state-warning)]/10 border-[var(--sdk-color-state-warning)]/30",
  rejected: "text-[var(--sdk-color-state-danger)] bg-[var(--sdk-color-state-danger)]/10 border-[var(--sdk-color-state-danger)]/30",
  reviewing: "text-[var(--sdk-color-brand-primary)] bg-[var(--sdk-color-brand-primary)]/10 border-[var(--sdk-color-brand-primary)]/30",
};

const TYPE_LABELS: Record<AfterSalesType, string> = {
  exchange: "换货",
  maintenance: "维修",
  refund: "仅退款",
  resend: "补发",
  return: "退货退款",
};

const MAX_EVIDENCE_FILES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function mapStatus(raw: string): AfterSalesStatus {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "approved" || normalized === "accept" || normalized === "accepted") {
    return "approved";
  }
  if (normalized === "cancelled" || normalized === "canceled" || normalized === "revoked") {
    return "cancelled";
  }
  if (normalized === "completed" || normalized === "done" || normalized === "finished") {
    return "completed";
  }
  if (normalized === "rejected" || normalized === "deny" || normalized === "denied") {
    return "rejected";
  }
  if (normalized === "reviewing" || normalized === "review" || normalized === "processing") {
    return "reviewing";
  }
  return "pending";
}

function mapType(raw: string): AfterSalesType {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "exchange" || normalized === "换货") {
    return "exchange";
  }
  if (normalized === "maintenance" || normalized === "repair" || normalized === "维修") {
    return "maintenance";
  }
  if (normalized === "resend" || normalized === "reship" || normalized === "补发") {
    return "resend";
  }
  if (normalized === "return" || normalized === "退货退款" || normalized === "return_refund") {
    return "return";
  }
  return "refund";
}

function mapRow(item: Record<string, unknown>): AfterSalesRow {
  const rawType = String(item.type ?? item.requestType ?? item.afterSalesType ?? "refund");
  const rawStatus = String(item.status ?? item.statusName ?? "pending");
  const mappedType = mapType(rawType);
  const mappedStatus = mapStatus(rawStatus);
  return {
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    id: String(item.id ?? ""),
    orderId: typeof item.orderId === "string" ? item.orderId : undefined,
    reason: typeof item.reason === "string" ? item.reason : typeof item.reasonCode === "string" ? item.reasonCode : undefined,
    requestedAmountCny:
      typeof item.requestedAmount === "number"
        ? item.requestedAmount
        : typeof item.requested_amount === "number"
          ? item.requested_amount
          : null,
    status: mappedStatus,
    statusLabel: typeof item.statusName === "string" ? item.statusName : STATUS_LABELS[mappedStatus],
    type: mappedType,
    typeLabel: TYPE_LABELS[mappedType],
  };
}

function formatTimestamp(value: string | undefined): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

const emptyForm = (): AfterSalesFormState => ({
  description: "",
  evidenceFiles: [],
  orderId: "",
  reason: "",
  requestedAmountCny: "",
  requestType: "refund",
});

function validateForm(form: AfterSalesFormState): AfterSalesFormErrors {
  const errors: AfterSalesFormErrors = {};
  if (!form.orderId.trim()) {
    errors.orderId = "请填写订单号";
  }
  if (!form.reason.trim()) {
    errors.reason = "请填写售后原因";
  } else if (form.reason.trim().length < 5) {
    errors.reason = "原因说明至少需要 5 个字符";
  }
  if (form.requestType === "refund" || form.requestType === "return") {
    if (!form.requestedAmountCny.trim()) {
      errors.requestedAmountCny = "请填写退款金额";
    } else {
      const amount = Number(form.requestedAmountCny);
      if (!Number.isFinite(amount) || amount <= 0) {
        errors.requestedAmountCny = "退款金额必须为正数";
      }
    }
  }
  return errors;
}

export function SdkworkMallAfterSalesPage() {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<AfterSalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AfterSalesFormState>(emptyForm);
  const [errors, setErrors] = useState<AfterSalesFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<AfterSalesRow | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [events, setEvents] = useState<Array<{ action: string; at?: string }>>([]);
  const [returnShipments, setReturnShipments] = useState<Array<{ id: string; status: string; tracking?: string }>>([]);

  const reload = useCallback(async () => {
    const service = getSdkworkCommerceService();
    const response = await service.afterSales.requests.list({});
    const payload = unwrapSdkworkCommerceResponse(response) as { items?: Record<string, unknown>[] };
    setRows(payload.items?.map(mapRow) ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    reload()
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reload]);

  useEffect(() => {
    const orderIdFromUrl = searchParams.get("orderId");
    if (orderIdFromUrl) {
      setForm((current) => ({ ...current, orderId: orderIdFromUrl }));
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setEvents([]);
      setReturnShipments([]);
      setSelectedRow(null);
      return;
    }
    let active = true;
    async function loadDetail() {
      const service = getSdkworkCommerceService();
      const [detailResult, eventsResult, returnResult] = await Promise.allSettled([
        service.afterSales.requests.retrieve(selectedId),
        service.afterSales.events.list(selectedId, { page: 1, page_size: 10 }),
        service.afterSales.returnShipments.list(selectedId, { page: 1, page_size: 5 }),
      ]);
      if (!active) {
        return;
      }
      if (detailResult.status === "fulfilled") {
        setDetail(unwrapSdkworkCommerceResponse(detailResult.value) as Record<string, unknown>);
      }
      if (eventsResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(eventsResult.value) as { items?: Record<string, unknown>[] };
        setEvents(
          payload.items?.map((item) => ({
            action: String(item.eventType ?? item.action ?? item.toStatus ?? "event"),
            at: typeof item.createdAt === "string" ? item.createdAt : undefined,
          })) ?? [],
        );
      }
      if (returnResult.status === "fulfilled") {
        const payload = unwrapSdkworkCommerceResponse(returnResult.value) as { items?: Record<string, unknown>[] };
        setReturnShipments(
          payload.items?.map((item) => ({
            id: String(item.id ?? item.returnShipmentNo ?? ""),
            status: String(item.status ?? "pending"),
            tracking: typeof item.trackingNo === "string" ? item.trackingNo : undefined,
          })) ?? [],
        );
      }
    }
    void loadDetail();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const selectedTypeMeta = useMemo(
    () => AFTER_SALES_TYPES.find((option) => option.value === form.requestType),
    [form.requestType],
  );

  function updateField<K extends keyof AfterSalesFormState>(field: K, value: AfterSalesFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => {
      const nextForm = { ...form, [field]: value };
      const nextErrors = validateForm(nextForm);
      const fieldError = field in nextErrors
        ? nextErrors[field as keyof AfterSalesFormErrors]
        : undefined;
      return {
        ...current,
        [field]: fieldError,
      };
    });
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const newFiles: EvidenceFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        setMessage(`文件 ${file.name} 超过 5MB 限制`);
        continue;
      }
      newFiles.push({
        id: `${file.name}-${file.size}-${Date.now()}`,
        name: file.name,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        size: file.size,
      });
    }
    setForm((current) => ({
      ...current,
      evidenceFiles: [...current.evidenceFiles, ...newFiles].slice(0, MAX_EVIDENCE_FILES),
    }));
    event.target.value = "";
  }

  function removeEvidenceFile(fileId: string) {
    setForm((current) => ({
      ...current,
      evidenceFiles: current.evidenceFiles.filter((file) => file.id !== fileId),
    }));
  }

  async function handleCreate() {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setTouched({
      description: true,
      orderId: true,
      reason: true,
      requestedAmountCny: true,
    });
    if (Object.keys(validationErrors).length > 0) {
      setMessage("请修正表单中的错误后再提交");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const service = getSdkworkCommerceService();
      const requestBody: Record<string, unknown> = {
        orderId: form.orderId.trim(),
        reasonCode: form.reason.trim() || "buyer-request",
        requestType: form.requestType,
        type: form.requestType,
        description: form.description.trim() || undefined,
      };
      if (form.requestType === "refund" || form.requestType === "return") {
        requestBody.requestedAmount = Number(form.requestedAmountCny);
      }
      if (form.evidenceFiles.length > 0) {
        requestBody.evidenceFiles = form.evidenceFiles.map((file) => ({
          fileName: file.name,
          fileSize: file.size,
        }));
      }
      await service.afterSales.requests.create(requestBody);
      setShowForm(false);
      setForm(emptyForm());
      setErrors({});
      setTouched({});
      setMessage("售后申请已提交，请耐心等待商家审核");
      await reload();
    } catch {
      setMessage("提交失败，请确认订单状态后重试");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(row: AfterSalesRow) {
    setBusy(true);
    setMessage(null);
    try {
      const service = getSdkworkCommerceService();
      await service.afterSales.requests.update(row.id, {
        action: "cancel",
        status: "cancelled",
      });
      setMessage("售后申请已撤销");
      await reload();
      if (selectedId === row.id) {
        setSelectedId(null);
      }
    } catch {
      setMessage("撤销失败，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  function handleModify(row: AfterSalesRow) {
    setForm({
      description: "",
      evidenceFiles: [],
      orderId: row.orderId ?? "",
      reason: row.reason ?? "",
      requestedAmountCny: row.requestedAmountCny != null ? String(row.requestedAmountCny) : "",
      requestType: row.type,
    });
    setErrors({});
    setTouched({});
    setShowForm(true);
    setMessage(null);
  }

  function openCreateForm() {
    setForm(emptyForm());
    setErrors({});
    setTouched({});
    setShowForm(true);
    setMessage(null);
  }

  function openDetail(row: AfterSalesRow) {
    setSelectedId(row.id);
    setSelectedRow(row);
  }

  if (loading) {
    return <LoadingBlock label="加载售后单..." />;
  }

  return (
    <div className="sdkwork-mall-pc-after-sales-page space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">售后中心</h1>
          <p className="mt-1 text-sm text-[var(--sdk-color-text-muted)]">
            管理退款、退货、换货、补发、维修等售后申请
          </p>
        </div>
        <Button onClick={openCreateForm} type="button">申请售后</Button>
      </header>

      {message ? <StatusNotice tone="default">{message}</StatusNotice> : null}

      {showForm ? (
        <section className="rounded-2xl border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel)] p-6">
          <h2 className="text-lg font-semibold">发起售后</h2>

          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-sm font-medium">
                订单号 <span className="text-[var(--sdk-color-state-danger)]">*</span>
              </span>
              <input
                className={`mt-1 w-full rounded-lg border bg-[var(--sdk-color-surface-panel)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sdk-color-border-focus)] ${
                  touched.orderId && errors.orderId
                    ? "border-[var(--sdk-color-state-danger)]"
                    : "border-[var(--sdk-color-border-default)]"
                }`}
                onChange={(event) => updateField("orderId", event.target.value)}
                placeholder="请输入需要售后的订单号"
                value={form.orderId}
              />
              {touched.orderId && errors.orderId ? (
                <span className="mt-1 block text-xs text-[var(--sdk-color-state-danger)]">{errors.orderId}</span>
              ) : null}
            </label>

            <fieldset className="block">
              <span className="text-sm font-medium">售后类型</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AFTER_SALES_TYPES.map((option) => (
                  <button
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      form.requestType === option.value
                        ? "border-[var(--sdk-color-brand-primary)] bg-[var(--sdk-color-brand-primary)]/5"
                        : "border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel)] hover:border-[var(--sdk-color-brand-primary)]"
                    }`}
                    key={option.value}
                    onClick={() => updateField("requestType", option.value)}
                    type="button"
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="mt-1 text-xs text-[var(--sdk-color-text-muted)]">{option.description}</div>
                  </button>
                ))}
              </div>
            </fieldset>

            {(form.requestType === "refund" || form.requestType === "return") ? (
              <label className="block">
                <span className="text-sm font-medium">
                  退款金额 <span className="text-[var(--sdk-color-state-danger)]">*</span>
                </span>
                <input
                  className={`mt-1 w-full rounded-lg border bg-[var(--sdk-color-surface-panel)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sdk-color-border-focus)] ${
                    touched.requestedAmountCny && errors.requestedAmountCny
                      ? "border-[var(--sdk-color-state-danger)]"
                      : "border-[var(--sdk-color-border-default)]"
                  }`}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^\d.]/g, "");
                    updateField("requestedAmountCny", value);
                  }}
                  placeholder="请输入退款金额"
                  value={form.requestedAmountCny}
                />
                {touched.requestedAmountCny && errors.requestedAmountCny ? (
                  <span className="mt-1 block text-xs text-[var(--sdk-color-state-danger)]">{errors.requestedAmountCny}</span>
                ) : null}
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium">
                原因说明 <span className="text-[var(--sdk-color-state-danger)]">*</span>
              </span>
              <textarea
                className={`mt-1 w-full rounded-lg border bg-[var(--sdk-color-surface-panel)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sdk-color-border-focus)] ${
                  touched.reason && errors.reason
                    ? "border-[var(--sdk-color-state-danger)]"
                    : "border-[var(--sdk-color-border-default)]"
                }`}
                onChange={(event) => updateField("reason", event.target.value)}
                placeholder="请详细描述售后原因，如商品瑕疵、与描述不符等"
                rows={3}
                value={form.reason}
              />
              {touched.reason && errors.reason ? (
                <span className="mt-1 block text-xs text-[var(--sdk-color-state-danger)]">{errors.reason}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">补充说明（可选）</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sdk-color-border-focus)]"
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="如有其他需要说明的情况请在此填写"
                rows={2}
                value={form.description}
              />
            </label>

            <fieldset className="block">
              <span className="text-sm font-medium">凭证上传（可选，最多 {MAX_EVIDENCE_FILES} 张）</span>
              <div className="mt-2">
                {form.evidenceFiles.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-3">
                    {form.evidenceFiles.map((file) => (
                      <div
                        className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-subtle)]"
                        key={file.id}
                      >
                        {file.previewUrl ? (
                          <img
                            alt={file.name}
                            className="h-full w-full object-cover"
                            src={file.previewUrl}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--sdk-color-text-muted)]">
                            文件
                          </div>
                        )}
                        <button
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sdk-color-surface-panel)] text-xs text-[var(--sdk-color-text-secondary)] shadow-[var(--sdk-shadow-sm)] hover:text-[var(--sdk-color-state-danger)]"
                          onClick={() => removeEvidenceFile(file.id)}
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--sdk-color-border-default)] px-4 py-2 text-sm text-[var(--sdk-color-text-secondary)] hover:border-[var(--sdk-color-brand-primary)]">
                  <span>上传凭证图片</span>
                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    type="file"
                  />
                </label>
                <p className="mt-1 text-xs text-[var(--sdk-color-text-muted)]">
                  支持 JPG/PNG 格式，单张不超过 5MB
                </p>
              </div>
            </fieldset>

            {selectedTypeMeta ? (
              <div className="rounded-lg border border-[var(--sdk-color-border-subtle)] bg-[var(--sdk-color-surface-subtle)] px-4 py-3 text-xs text-[var(--sdk-color-text-muted)]">
                <strong className="text-[var(--sdk-color-text-secondary)]">{selectedTypeMeta.label}：</strong>
                {selectedTypeMeta.description}
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button disabled={busy} onClick={() => void handleCreate()} type="button">提交申请</Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm());
                  setErrors({});
                  setTouched({});
                }}
                type="button"
                variant="ghost"
              >
                取消
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {rows.length === 0 && !showForm ? (
        <EmptyState description="可在订单详情中发起退款/退货/换货/补发/维修申请" title="暂无售后单" />
      ) : rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <article
              className="rounded-2xl border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel)] p-5"
              key={row.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--sdk-color-brand-primary)]/30 bg-[var(--sdk-color-brand-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--sdk-color-brand-primary)]">
                      {row.typeLabel}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_TONES[row.status]}`}
                    >
                      {row.statusLabel}
                    </span>
                    {row.orderId ? (
                      <Link
                        className="text-xs text-[var(--sdk-color-text-secondary)] hover:text-[var(--sdk-color-brand-primary)]"
                        to="/buyer/orders"
                      >
                        订单：{row.orderId}
                      </Link>
                    ) : null}
                    <span className="text-xs text-[var(--sdk-color-text-muted)]">
                      {formatTimestamp(row.createdAt)}
                    </span>
                  </div>
                  {row.reason ? (
                    <p className="mt-2 text-sm text-[var(--sdk-color-text-secondary)]">{row.reason}</p>
                  ) : null}
                  {row.requestedAmountCny != null ? (
                    <p className="mt-1 text-xs text-[var(--sdk-color-text-muted)]">
                      申请金额：{formatSdkworkCommerceCurrencyCny(row.requestedAmountCny)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => openDetail(row)}
                    type="button"
                    variant="outline"
                  >
                    详情
                  </Button>
                  {(row.status === "pending" || row.status === "reviewing") ? (
                    <>
                      <Button
                        disabled={busy}
                        onClick={() => void handleModify(row)}
                        type="button"
                        variant="ghost"
                      >
                        修改
                      </Button>
                      <Button
                        disabled={busy}
                        onClick={() => void handleRevoke(row)}
                        type="button"
                        variant="ghost"
                      >
                        撤销
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {selectedId && (detail || selectedRow) ? (
        <section className="rounded-2xl border border-[var(--sdk-color-border-default)] bg-[var(--sdk-color-surface-panel)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">售后详情</h2>
            <Button
              onClick={() => setSelectedId(null)}
              type="button"
              variant="ghost"
            >
              关闭
            </Button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">售后单号</div>
              <div className="mt-1 text-sm font-medium">{selectedId}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">售后类型</div>
              <div className="mt-1 text-sm font-medium">
                {selectedRow?.typeLabel ?? String(detail?.type ?? detail?.requestType ?? detail?.afterSalesType ?? "-")}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">状态</div>
              <div className="mt-1">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    selectedRow ? STATUS_TONES[selectedRow.status] : STATUS_TONES.pending
                  }`}
                >
                  {selectedRow?.statusLabel ?? String(detail?.status ?? "-")}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">原因</div>
              <div className="mt-1 text-sm">
                {String(detail?.reasonCode ?? detail?.reason ?? selectedRow?.reason ?? "-")}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">申请金额</div>
              <div className="mt-1 text-sm">
                {formatSdkworkCommerceCurrencyCny(
                  typeof detail?.requestedAmount === "number"
                    ? detail.requestedAmount
                    : typeof detail?.requested_amount === "number"
                      ? detail.requested_amount
                      : selectedRow?.requestedAmountCny,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--sdk-color-text-muted)]">订单号</div>
              <div className="mt-1 text-sm">
                {selectedRow?.orderId ?? String(detail?.orderId ?? "-")}
              </div>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">处理进度</h3>
              <ol className="mt-3 space-y-2 border-l border-[var(--sdk-color-border-default)] pl-4">
                {events.map((event, index) => (
                  <li className="relative" key={`${event.action}-${index}`}>
                    <span className="absolute -left-[1.4rem] top-1 flex h-2 w-2 items-center justify-center rounded-full bg-[var(--sdk-color-brand-primary)]" />
                    <div className="text-sm font-medium">{event.action}</div>
                    {event.at ? (
                      <div className="text-xs text-[var(--sdk-color-text-muted)]">
                        {formatTimestamp(event.at)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {returnShipments.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">退货物流</h3>
              <ul className="mt-3 space-y-2">
                {returnShipments.map((shipment) => (
                  <li
                    className="flex items-center justify-between rounded-lg border border-[var(--sdk-color-border-subtle)] px-4 py-2 text-sm"
                    key={shipment.id}
                  >
                    <span>
                      <span className="font-medium">{shipment.id}</span>
                      <span className="ml-2 text-[var(--sdk-color-text-muted)]">{shipment.status}</span>
                    </span>
                    {shipment.tracking ? (
                      <span className="text-xs text-[var(--sdk-color-text-secondary)]">
                        运单号：{shipment.tracking}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
