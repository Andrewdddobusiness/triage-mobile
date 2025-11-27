import { supabase } from "./supabase";

export type FeatureFlagState = {
  killSwitch: boolean;
  telephony: boolean;
  payments: boolean;
  notifications: boolean;
  analytics: boolean;
  safeModeMessage?: string | null;
  source: "default" | "remote" | "error" | "cache";
  fetchedAt: number | null;
};

type FeatureFlagRecord = {
  key: string;
  enabled: boolean;
  rollout_percentage?: number | null;
  safe_mode_message?: string | null;
};

const TTL_MS = 5 * 60 * 1000; // 5 minutes

const defaultFlags: FeatureFlagState = {
  killSwitch: false,
  telephony: true,
  payments: true,
  notifications: true,
  analytics: true,
  safeModeMessage: null,
  source: "default",
  fetchedAt: null,
};

let cachedFlags: FeatureFlagState = { ...defaultFlags };
let lastFetched: number | null = null;

function stringHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function isInRollout(record: FeatureFlagRecord, userId?: string) {
  const pct = record.rollout_percentage ?? 100;
  if (pct >= 100) return true;
  if (pct <= 0) return false;

  const bucket = stringHash(`${record.key}:${userId || "anon"}`) % 100;
  return bucket < pct;
}

function evaluateFlags(records: FeatureFlagRecord[], userId?: string): FeatureFlagState {
  const next: FeatureFlagState = {
    ...defaultFlags,
    source: "remote",
    fetchedAt: Date.now(),
  };

  for (const record of records) {
    const eligible = isInRollout(record, userId);
    if (!eligible) continue;

    switch (record.key) {
      case "kill_switch":
        next.killSwitch = record.enabled;
        if (record.safe_mode_message) next.safeModeMessage = record.safe_mode_message;
        break;
      case "telephony":
        next.telephony = record.enabled;
        break;
      case "payments":
        next.payments = record.enabled;
        break;
      case "notifications":
        next.notifications = record.enabled;
        break;
      case "analytics":
        next.analytics = record.enabled;
        break;
      default:
        break;
    }

    if (!next.safeModeMessage && record.safe_mode_message) {
      next.safeModeMessage = record.safe_mode_message;
    }
  }

  if (next.killSwitch) {
    next.telephony = false;
    next.payments = false;
    next.notifications = false;
    next.analytics = false;
  }

  return next;
}

export function getCachedFlags(): FeatureFlagState {
  return cachedFlags;
}

export async function fetchFeatureFlags(options: { userId?: string; force?: boolean } = {}): Promise<FeatureFlagState> {
  const now = Date.now();
  const shouldUseCache = !options.force && lastFetched && now - lastFetched < TTL_MS;

  if (shouldUseCache && cachedFlags) {
    cachedFlags = { ...cachedFlags, source: "cache" };
    return cachedFlags;
  }

  try {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("key, enabled, rollout_percentage, safe_mode_message");

    if (error) {
      throw error;
    }

    const next = evaluateFlags((data as FeatureFlagRecord[]) || [], options.userId);
    cachedFlags = next;
    lastFetched = now;
    return next;
  } catch (_err) {
    const fallback: FeatureFlagState = {
      ...defaultFlags,
      source: "error",
      fetchedAt: now,
    };
    cachedFlags = fallback;
    lastFetched = now;
    return fallback;
  }
}
