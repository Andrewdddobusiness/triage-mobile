/**
 * Utilities for masking and scrubbing PII before rendering or logging.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /\+?\d[\d\s().-]{6,}\d/;

export function maskPhone(phone: string, visibleDigits = 4): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= visibleDigits) {
    return "••••".slice(0, Math.max(visibleDigits, digits.length));
  }
  const last = digits.slice(-visibleDigits);
  const masked = "•".repeat(Math.max(digits.length - visibleDigits, 6));
  return `${masked}${last}`;
}

export function maskEmail(email: string): string {
  if (!emailRegex.test(email)) return email;
  const [local, domain] = email.split("@");
  const domainParts = domain.split(".");
  const tld = domainParts.pop() || "";
  const domainRoot = domainParts.join(".") || "";

  const safeLocal =
    local.length <= 2 ? `${local[0] || ""}***` : `${local[0]}***${local.slice(-1)}`;
  const safeDomain =
    domainRoot.length <= 2 ? `${domainRoot[0] || ""}***` : `${domainRoot[0]}***${domainRoot.slice(-1)}`;

  return `${safeLocal}@${safeDomain}.${tld || "***"}`;
}

function maskIfSensitive(value: string): string {
  if (emailRegex.test(value)) return maskEmail(value);
  if (phoneRegex.test(value)) return maskPhone(value);
  return value;
}

/**
 * Recursively scrubs likely PII values from an object before logging/analytics.
 */
export function scrubPII<T>(input: T): T {
  if (input === null || input === undefined) return input;

  if (typeof input === "string") {
    return maskIfSensitive(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => scrubPII(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      result[key] = scrubPII(value);
    }
    return result as T;
  }

  return input;
}

