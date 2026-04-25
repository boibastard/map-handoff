// lib/logger.ts

export function logInfo(scope: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${scope}] ${message}`, data ?? "");
  }
}

export function logError(scope: string, message: string, error?: unknown) {
  console.error(`[${scope}] ${message}`, error ?? "");
}