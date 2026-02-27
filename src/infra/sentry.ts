import process from "node:process";
import { resolveRuntimeServiceVersion } from "../version.js";

let sentryModule: typeof import("@sentry/node") | undefined;

/**
 * Initialise Sentry **only** when SENTRY_DSN is set.
 * Safe to call unconditionally – a missing DSN or a missing @sentry/node
 * package both result in a silent no-op.
 */
export async function initSentry(): Promise<void> {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }

  try {
    sentryModule = await import("@sentry/node");
  } catch {
    // @sentry/node not installed – skip silently.
    return;
  }

  sentryModule.init({
    dsn,
    release: resolveRuntimeServiceVersion(),
    // Keep the default integrations but avoid noisy breadcrumbs in a CLI tool.
    defaultIntegrations: false,
  });
}

/** Forward an error to Sentry if it has been initialised. */
export function sentryCaptureException(err: unknown): void {
  sentryModule?.captureException(err);
}
