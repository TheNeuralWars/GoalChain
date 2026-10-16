// GoalWorld waitlist — Cloudflare Worker on route goalworld.fun/api/waitlist*
// Bindings: WAITLIST (KV namespace), RESEND_API_KEY (secret, send-only), FROM (var, optional)
const EMAIL_RE = /^[^\s@<>"]{1,64}@[^\s@<>"]+\.[a-z]{2,}$/i;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function handle(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");
  let email = "", hp = "";
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) { const b = await request.json(); email = b.email; hp = b.website; }
    else { const f = await request.formData(); email = f.get("email"); hp = f.get("website"); }
  } catch { return json({ ok: false, error: "bad_request" }, 400); }
  const done = (status, extra = {}) => wantsJson ? json({ ok: status < 400, ...extra }, status)
    : Response.redirect(`${url.origin}/?waitlist=${status < 400 ? "ok" : "error"}#waitlist`, 303);
  if (hp) return done(200); // honeypot: pretend success
  email = String(email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return done(400, { error: "invalid_email" });
  const key = `signup:${email}`;
  if (await env.WAITLIST.get(key)) return done(200, { already: true });
  const ip = request.headers.get("cf-connecting-ip") || "";
  const rlKey = `rl:${ip}`;
  const n = parseInt((await env.WAITLIST.get(rlKey)) || "0", 10);
  if (ip && n >= 5) return done(429, { error: "rate_limited" });
  if (ip) await env.WAITLIST.put(rlKey, String(n + 1), { expirationTtl: 3600 });
  await env.WAITLIST.put(key, JSON.stringify({ email, at: new Date().toISOString(), country: request.cf?.country || null }));
  let mailed = false;
  try {
    const r = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json", "user-agent": "goalworld-waitlist/1.0" },
      body: JSON.stringify({
        from: env.FROM || "Nico at GoalWorld <nico@goalworld.fun>", to: [email],
        subject: "You're on the GoalWorld waitlist",
        text: "Thanks for joining the GoalWorld waitlist!\n\nWe'll email you when there's something new to play, read or watch in The Neural Wars.\n\n— Nico\nhttps://goalworld.fun\n\nDidn't sign up? Just ignore this email and you won't hear from us.",
      }),
    });
    mailed = r.ok;
    if (!r.ok) console.log("resend error", r.status, await r.text());
  } catch { mailed = false; }
  return done(200, { mailed });
}
export default { fetch: (req, env) => handle(req, env) };
