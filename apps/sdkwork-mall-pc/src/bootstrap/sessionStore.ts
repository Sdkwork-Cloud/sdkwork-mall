export interface SdkworkMallPcSessionSnapshot {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
  sessionId?: string;
  context?: {
    tenantId?: string;
    userId?: string;
    organizationId?: string;
    sessionId?: string;
    appId?: string;
    environment?: string;
    deploymentMode?: string;
  };
  updatedAt?: string;
}

export interface SdkworkMallPcSessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SdkworkMallPcSessionStore {
  clearSession(): void;
  getSnapshot(): SdkworkMallPcSessionSnapshot;
  refreshSession(): SdkworkMallPcSessionSnapshot;
  setSession(nextSession: SdkworkMallPcSessionSnapshot): void;
  subscribe(listener: (snapshot: SdkworkMallPcSessionSnapshot) => void): () => void;
}

export const SDKWORK_COMMERCE_PC_SESSION_STORAGE_KEY = "sdkwork-mall-pc-session";

function readInitialSession(
  storage: SdkworkMallPcSessionStorageLike | undefined,
  storageKey: string,
): SdkworkMallPcSessionSnapshot {
  if (!storage) {
    return {};
  }

  try {
    const raw = storage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as SdkworkMallPcSessionSnapshot) : {};
  } catch {
    return {};
  }
}

export function createSdkworkMallPcSessionStore(
  storage?: SdkworkMallPcSessionStorageLike,
  storageKey = SDKWORK_COMMERCE_PC_SESSION_STORAGE_KEY,
): SdkworkMallPcSessionStore {
  let snapshot = readInitialSession(storage, storageKey);
  const listeners = new Set<(nextSnapshot: SdkworkMallPcSessionSnapshot) => void>();

  const emit = () => {
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  const persist = () => {
    if (!storage) {
      return;
    }

    if (!snapshot.authToken && !snapshot.accessToken && !snapshot.refreshToken) {
      storage.removeItem(storageKey);
      return;
    }

    storage.setItem(storageKey, JSON.stringify(snapshot));
  };

  return {
    clearSession() {
      snapshot = {};
      persist();
      emit();
    },
    getSnapshot() {
      return snapshot;
    },
    refreshSession() {
      snapshot = readInitialSession(storage, storageKey);
      emit();
      return snapshot;
    },
    setSession(nextSession) {
      snapshot = {
        ...nextSession,
        updatedAt: new Date().toISOString(),
      };
      persist();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function hasSdkworkMallPcIamSession(
  snapshot: SdkworkMallPcSessionSnapshot,
): boolean {
  return Boolean(snapshot.authToken && snapshot.accessToken && snapshot.context?.tenantId);
}
