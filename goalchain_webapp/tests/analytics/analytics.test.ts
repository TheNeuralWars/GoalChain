// Run: npm run test:analytics  (Node >= 22.18 strips TS types natively)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAttribution, toSuperProperties, isCampaignTouch } from '../../src/analytics/attribution.ts';
import { redactString, redactDeep, REDACTED_WALLET } from '../../src/analytics/redact.ts';
import { resolveAnalyticsConfig, FALLBACK_POSTHOG_TOKEN, FALLBACK_POSTHOG_HOST } from '../../src/analytics/config.ts';
import { matchResult, durationSeconds, bestRarity } from '../../src/analytics/events.ts';

const SOL = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

test('X link from @nicopez with UTM → channel x + x_account', () => {
  const a = parseAttribution(
    'https://play.goalworld.fun/estadio?utm_source=x&utm_medium=social&utm_campaign=launch&utm_content=nicopez',
    'https://t.co/abc',
    'play.goalworld.fun',
  );
  assert.equal(a.channel, 'x');
  assert.equal(a.x_account, 'nicopez');
  assert.equal(a.utm_campaign, 'launch');
  assert.equal(a.landing_path, '/estadio');
  assert.equal(a.referring_domain, 't.co');
  assert.ok(isCampaignTouch(a));
});

test('plain t.co click without UTM is still attributed to X', () => {
  const a = parseAttribution('https://play.goalworld.fun/', 'https://t.co/xyz', 'play.goalworld.fun');
  assert.equal(a.channel, 'x');
  assert.equal(a.utm_source, undefined);
});

test('@ handle in campaign is normalised', () => {
  const a = parseAttribution('https://play.goalworld.fun/?utm_source=twitter&utm_campaign=%40NicoPez', '', 'play.goalworld.fun');
  assert.equal(a.channel, 'x');
  assert.equal(a.x_account, 'nicopez');
});

test('same-host referrer is direct; goalworld.fun landing is owned', () => {
  const self = parseAttribution('https://play.goalworld.fun/club', 'https://play.goalworld.fun/', 'play.goalworld.fun');
  assert.equal(self.channel, 'direct');
  assert.equal(self.referring_domain, undefined);
  const owned = parseAttribution('https://play.goalworld.fun/club', 'https://www.goalworld.fun/', 'play.goalworld.fun');
  assert.equal(owned.channel, 'owned');
  assert.equal(owned.referring_domain, 'www.goalworld.fun');
  assert.equal(isCampaignTouch(owned), false);
});

test('search + referral channels', () => {
  assert.equal(parseAttribution('https://play.goalworld.fun/', 'https://www.google.com/', 'play.goalworld.fun').channel, 'search');
  assert.equal(parseAttribution('https://play.goalworld.fun/', 'https://news.ycombinator.com/', 'play.goalworld.fun').channel, 'referral');
});

test('super properties are prefixed and drop empties', () => {
  const a = parseAttribution('https://play.goalworld.fun/?utm_source=x', '', 'play.goalworld.fun');
  const p = toSuperProperties(a, 'first_touch');
  assert.equal(p.first_touch_utm_source, 'x');
  assert.equal(p.first_touch_channel, 'x');
  assert.equal(p.first_touch_landing_path, '/');
  assert.ok(!('first_touch_utm_medium' in p));
});

test('redacts Solana + EVM addresses and emails, keeps normal text', () => {
  assert.equal(redactString(`wallet ${SOL} connected`), `wallet ${REDACTED_WALLET} connected`);
  assert.equal(redactString('0x52908400098527886E0F7030069857D2E4169EE7'), REDACTED_WALLET);
  assert.equal(redactString('mail nico@example.com now'), 'mail [email] now');
  assert.equal(redactString('Connect Wallet'), 'Connect Wallet');
  // long pure-letter slug is not an address
  const slug = 'thequickbrownfoxjumpsoverthelazydogagain';
  assert.equal(redactString(slug), slug);
});

test('redactDeep walks nested props and leaves replay payload alone', () => {
  const out = redactDeep({
    $current_url: `https://play.goalworld.fun/perfil/x?w=${SOL}`,
    $elements: [{ $el_text: SOL }],
    $snapshot_data: [{ text: SOL }],
    n: 3,
  });
  assert.ok(!out.$current_url.includes(SOL));
  assert.equal(out.$elements[0].$el_text, REDACTED_WALLET);
  assert.equal(out.$snapshot_data[0].text, SOL);
  assert.equal(out.n, 3);
});

test('config: fallback, env override, disable switch, bad host', () => {
  const d = resolveAnalyticsConfig({});
  assert.deepEqual(d, { enabled: true, token: FALLBACK_POSTHOG_TOKEN, apiHost: FALLBACK_POSTHOG_HOST });
  assert.equal(resolveAnalyticsConfig({ VITE_POSTHOG_HOST: 'https://us.i.posthog.com/' }).apiHost, 'https://us.i.posthog.com');
  assert.equal(resolveAnalyticsConfig({ VITE_POSTHOG_HOST: 'javascript:alert(1)' }).apiHost, FALLBACK_POSTHOG_HOST);
  assert.equal(resolveAnalyticsConfig({ VITE_POSTHOG_DISABLED: '1' }).enabled, false);
  assert.equal(resolveAnalyticsConfig({ VITE_POSTHOG_TOKEN: 'sk_not_public' }).enabled, false);
});

test('event helpers', () => {
  assert.equal(matchResult(2, 1), 'win');
  assert.equal(matchResult(1, 1), 'draw');
  assert.equal(matchResult(0, 3), 'loss');
  assert.equal(durationSeconds(0, 61_400), 61);
  assert.equal(durationSeconds(10_000, 0), 0);
  assert.equal(durationSeconds(0, 10 * 3600 * 1000), 6 * 3600);
  assert.equal(bestRarity(undefined, 'rare'), 'rare');
  assert.equal(bestRarity('rare', 'common'), 'rare');
  assert.equal(bestRarity('rare', 'Legendary'), 'Legendary');
});
