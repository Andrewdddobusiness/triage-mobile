import * as Sentry from "sentry-expo";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    tracesSampleRate: 0.05,
  });
  initialized = true;
}
