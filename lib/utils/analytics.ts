// Lightweight analytics helper to keep the app callable even without a provider.
// Swap the implementation to a real client (e.g., Mixpanel) without changing callers.
import { scrubPII } from "./pii";

export function trackEvent(event: string, props?: Record<string, unknown>) {
  try {
    const safeProps = props ? scrubPII(props) : undefined;
    if (__DEV__) {
      console.log("[analytics]", event, safeProps || {});
    }
    // placeholder for real analytics wiring
  } catch (err) {
    // swallow analytics errors to avoid impacting UX
  }
}
