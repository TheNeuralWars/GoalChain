/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_PROGRAM_ID?: string;
  /** PostHog public project token (phc_…). Falls back to project 304954. */
  readonly VITE_POSTHOG_TOKEN?: string;
  /** PostHog ingestion host. Defaults to https://eu.i.posthog.com. */
  readonly VITE_POSTHOG_HOST?: string;
  /** Set to 1 to disable analytics entirely. */
  readonly VITE_POSTHOG_DISABLED?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
