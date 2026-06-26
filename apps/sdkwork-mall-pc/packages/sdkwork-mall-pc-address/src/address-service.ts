import {
  hasSdkworkAccountSession,
  requireSdkworkAccountSession,
  toSdkworkAccountOptionalString,
} from "@sdkwork/account-service";
import {
  getSdkworkAddressRemotePort,
  type SdkworkAddressInput,
  type SdkworkAddressRecord,
  type SdkworkAddressRemotePort,
} from "./address-remote-port";

export interface CreateSdkworkAddressServiceOptions {
  remotePort?: SdkworkAddressRemotePort;
}

export interface SdkworkAddressService {
  createAddress(input: SdkworkAddressInput): Promise<void>;
  deleteAddress(addressId: string): Promise<void>;
  listAddresses(): Promise<SdkworkAddressRecord[]>;
  setDefaultAddress(addressId: string): Promise<void>;
  updateAddress(addressId: string, input: SdkworkAddressInput): Promise<void>;
}

function unwrapAddressListPayload(value: unknown): SdkworkAddressRecord[] {
  if (Array.isArray(value)) {
    return value.map((item) => mapAddressRow(item as Record<string, unknown>));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  if ("data" in record || "code" in record) {
    const data = (record as { data?: unknown }).data;
    return unwrapAddressListPayload(data);
  }

  const items = record.items;
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => mapAddressRow(item as Record<string, unknown>));
}

function mapAddressRow(item: Record<string, unknown>): SdkworkAddressRecord {
  const rawTag = typeof item.tag === "string" ? item.tag.toLowerCase() : "";
  let tag: SdkworkAddressRecord["tag"] | undefined;
  if (rawTag === "home" || rawTag === "company" || rawTag === "school" || rawTag === "other") {
    tag = rawTag;
  } else if (rawTag === "家") {
    tag = "home";
  } else if (rawTag === "公司") {
    tag = "company";
  } else if (rawTag === "学校") {
    tag = "school";
  }

  return {
    id: String(item.id ?? ""),
    name: String(item.contactName ?? item.name ?? "收件人"),
    phone: toSdkworkAccountOptionalString(item.phone),
    province: toSdkworkAccountOptionalString(item.province),
    city: toSdkworkAccountOptionalString(item.city),
    district: toSdkworkAccountOptionalString(item.district),
    detail: toSdkworkAccountOptionalString(item.detail),
    isDefault: Boolean(item.isDefault ?? item.default),
    tag,
  };
}

async function assertAddressMutationSucceeded(value: unknown): Promise<void> {
  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as { code?: number | string; message?: string; msg?: string };
  if (record.code === undefined || record.code === null || record.code === "") {
    return;
  }

  const normalized = String(record.code).trim();
  if (normalized === "0" || normalized === "200" || normalized === "2000" || normalized === "SUCCESS") {
    return;
  }

  throw new Error(String(record.message || record.msg || "Address request failed.").trim());
}

export function createSdkworkAddressService(
  options: CreateSdkworkAddressServiceOptions = {},
): SdkworkAddressService {
  const getRemotePort = () => options.remotePort ?? getSdkworkAddressRemotePort();

  return {
    async listAddresses() {
      if (!hasSdkworkAccountSession()) {
        return [];
      }

      const payload = await getRemotePort().listAddresses();
      return unwrapAddressListPayload(payload);
    },

    async createAddress(input) {
      requireSdkworkAccountSession("请先登录后再管理收货地址");
      await assertAddressMutationSucceeded(await getRemotePort().createAddress(input));
    },

    async updateAddress(addressId, input) {
      requireSdkworkAccountSession("请先登录后再管理收货地址");
      await assertAddressMutationSucceeded(await getRemotePort().updateAddress(addressId, input));
    },

    async deleteAddress(addressId) {
      requireSdkworkAccountSession("请先登录后再管理收货地址");
      await assertAddressMutationSucceeded(await getRemotePort().deleteAddress(addressId));
    },

    async setDefaultAddress(addressId) {
      requireSdkworkAccountSession("请先登录后再管理收货地址");
      await assertAddressMutationSucceeded(await getRemotePort().setDefaultAddress(addressId));
    },
  };
}

export const sdkworkAddressService = createSdkworkAddressService();
