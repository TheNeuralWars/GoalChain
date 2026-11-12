/**
 * Lazy PostHog client.
 *
 * posthog-js (~55 kB gz) is kept OUT of the first-paint bundle: it is
 * dynamically imported once the browser is idle after `load`. Every call made
 * before that (track, exceptions, attribution) is queued and flushed in order
 * once the SDK is ready, so early game/registration events are not lost.
 *
 * Privacy defaults:
 *  - person_profiles: 'identified_only' — we never call identify(), so no
 *    person profiles / PII are created; attribution rides as super properties.
 *  - session replay masks every input and wallet/address UI; before_send
 *    scrubs wallet addresses and emails from all properties.
 *  - surveys, product tours, conversations, web experiments, heatmaps and
 *    feature-flag evaluation are disabled (no PostHog AI features are used).
 */
import type { PostHog, CaptureResult, Properties } from 'posthog-js';
import { resolveAnalyticsConfig, POSTHOG_UI_HOST } from './config';
import { redactDeep } from './redact';
import { isCampaignTouch, parseAttribution, toSuperProperties } from './attribution';
import type { AnalyticsEventMap, AnalyticsEventName } from './events';

type QueuedCall = (ph: PostHog) => void;

const FIRST_TOUCH_KEY = 'gc_ph_first_touch_v1';

/** CSS selectors whose text is masked in session replay (wallet addresses, keys). */
export const REPLAY_MASK_TEXT_SELECTOR = [
  '[data-ph-mask]',
  '.wallet-adapter-button',
  '.wallet-adapter-dropdown',
  '.wallet-adapter-dropdown-list',
  '.wallet-connected-badge',
  '.create-user-success code',
  '.wallet-pill',
].join(', ');

let instance: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: QueuedCall[] = [];
const MAX_QUEUE = 200;

const config = resolveAnalyticsConfig(import.meta.env as Record<string, string | undefined>);

function enqueue(call: QueuedCall): void {
  if (!config.enabled) return;
  if (instance) {
    try {
      call(instance);
    } catch (err) {
      console.warn('[analytics] call failed (non-fatal)', err);
    }
    return;
  }
  if (queue.length < MAX_QUEUE) queue.push(call);
}

function computeAttribution(): Record<string, string> {
  try {
    const a = parseAttribution(window.location.href, document.referrer, window.location.hostname);
    const props: Record<string, string> = {};
    let first: Record<string, string> | null = null;
    try {
      const raw = localStorage.getItem(FIRST_TOUCH_KEY);
      first = raw ? (JSON.parse(raw) as Record<string, string>) : null;
    } catch {
      first = null;
    }
    if (!first) {
      first = toSuperProperties(a, 'first_touch');
      try {
        localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(first));
      } catch {
        /* storage blocked — super props still registered for this session */
      }
    }
    Object.assign(props, first);
    if (isCampaignTouch(a)) Object.assign(props, toSuperProperties(a, 'last_touch'));
    return props;
  } catch {
    return {};
  }
}

function beforeSend(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  if (event.event === '$snapshot') return event; // replay data is masked at record time
  return {
    ...event,
    properties: redactDeep(event.properties),
    ...(event.$set ? { $set: redactDeep(event.$set) } : {}),
    ...(event.$set_once ? { $set_once: redactDeep(event.$set_once) } : {}),
  };
}

async function load(): Promise<PostHog | null> {
  if (!config.enabled) return null;
  if (instance) return instance;
  if (loading) return loading;
  loading = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(config.token, {
        api_host: config.apiHost,
        ui_host: POSTHOG_UI_HOST,
        defaults: '2026-08-30',
        capture_pageview: 'history_change',
        capture_pageleave: true,
        autocapture: true,
        person_profiles: 'identified_only',
        capture_exceptions: {
          capture_unhandled_errors: true,
          capture_unhandled_rejections: true,
          capture_console_errors: false,
        },
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: REPLAY_MASK_TEXT_SELECTOR,
          recordCrossOriginIframes: false,
        },
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        before_send: beforeSend,
        loaded: (ph) => {
          if (window.location.search.includes('ph_debug=1')) ph.debug(true);
        },
      });
      posthog.register_once(computeAttribution());
      posthog.register({ app: 'play', app_env: import.meta.env.MODE });
      instance = posthog;
      for (const call of queue.splice(0)) {
        try {
          call(posthog);
        } catch (err) {
          console.warn('[analytics] queued call failed (non-fatal)', err);
        }
      }
      return posthog;
    })
    .catch((err) => {
      console.warn('[analytics] PostHog failed to load (non-fatal)', err);
      loading = null;
      return null;
    });
  return loading;
}

// --- Pre-SDK error buffer -------------------------------------------------
// posthog-js installs its own window error/unhandledrejection handlers once
// loaded. Until then, buffer errors so crashes during first paint are kept.
let earlyHandlersInstalled = false;
function installEarlyErrorBuffer(): void {
  if (earlyHandlersInstalled || !config.enabled) return;
  earlyHandlersInstalled = true;
  const onError = (e: ErrorEvent) => {
    if (instance) return;
    const err = e.error instanceof Error ? e.error : new Error(e.message || 'window.onerror');
    captureException(err, { source: 'pre_sdk_window_error' });
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    if (instance) return;
    const r = e.reason;
    captureException(r instanceof Error ? r : new Error(String(r)), { source: 'pre_sdk_unhandled_rejection' });
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
}

/**
 * Boot analytics: install the early error buffer now, load the SDK when idle.
 * Safe to call multiple times.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || !config.enabled) return;
  installEarlyErrorBuffer();
  const kick = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) ric(() => void load(), { timeout: 3000 });
    else setTimeout(() => void load(), 1500);
  };
  if (document.readyState === 'complete') kick();
  else window.addEventListener('load', kick, { once: true });
}

/** Typed product event. */
export function track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
  enqueue((ph) => ph.capture(event, props as unknown as Properties));
}

/** Manually report a caught error (also used for pre-SDK buffering). */
export function captureException(error: unknown, props?: Record<string, unknown>): void {
  enqueue((ph) => ph.captureException(error, props));
}

/** For tests/diagnostics: whether the SDK finished loading. */
export function isAnalyticsLoaded(): boolean {
  return instance !== null;
}

/** For diagnostics only (e.g. `ph_debug=1`). */
export function getAnalyticsConfig() {
  return { ...config };
}
