import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchFeatureFlags, getCachedFlags, type FeatureFlagState } from "~/lib/featureFlags";
import { useSession } from "~/lib/auth/ctx";
import { trackEvent } from "~/lib/utils/analytics";

type FeatureFlagContextValue = {
  flags: FeatureFlagState;
  loading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
};

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: getCachedFlags(),
  loading: true,
  error: null,
  refresh: async () => {},
});

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [flags, setFlags] = useState<FeatureFlagState>(() => getCachedFlags());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (force = false) => {
      setLoading(true);
      try {
        const next = await fetchFeatureFlags({ userId: session?.user?.id, force });
        setFlags(next);
        setError(null);
        trackEvent("feature_flags_fetched", {
          source: next.source,
          killSwitch: next.killSwitch,
          telephony: next.telephony,
          payments: next.payments,
          notifications: next.notifications,
          analytics: next.analytics,
        });
      } catch (err) {
        setError((err as Error)?.message || "Failed to load feature flags");
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
