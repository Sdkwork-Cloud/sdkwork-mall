export interface SdkworkAddressRecord {
  city?: string;
  detail?: string;
  district?: string;
  id: string;
  isDefault: boolean;
  name: string;
  phone?: string;
  province?: string;
  tag?: "company" | "home" | "other" | "school";
}

export interface SdkworkAddressInput {
  city?: string;
  contactName: string;
  detail: string;
  district?: string;
  phone: string;
  province?: string;
  tag?: SdkworkAddressRecord["tag"];
}

export interface SdkworkAddressRemotePort {
  createAddress(body: SdkworkAddressInput): Promise<unknown>;
  deleteAddress(addressId: string): Promise<unknown>;
  listAddresses(): Promise<unknown>;
  setDefaultAddress(addressId: string): Promise<unknown>;
  updateAddress(addressId: string, body: SdkworkAddressInput): Promise<unknown>;
}

let addressRemotePort: SdkworkAddressRemotePort | null = null;

export function configureSdkworkAddressRemotePort(port: SdkworkAddressRemotePort | null): void {
  addressRemotePort = port;
}

export function getSdkworkAddressRemotePort(): SdkworkAddressRemotePort {
  if (!addressRemotePort) {
    throw new Error(
      "SDKWork address remote port is not configured. Call configureSdkworkAddressRemotePort() from mall PC bootstrap.",
    );
  }
  return addressRemotePort;
}
