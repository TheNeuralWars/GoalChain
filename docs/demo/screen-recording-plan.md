# GoalChain Content Engine — Screen Recording Plan

**Director:** Manager (Hermes Agent)  
**Operator:** Nico (CEO)  
**Target:** 4 distinct flows for Scene 3 (Live Demo Walkthrough)  
**Recording Tool:** OBS Studio (preferred) or ScreenFlow  
**Canvas:** 1440p (2560×1440) @ 60fps  
**Audio:** System audio OFF — Nico records VO in post  
**Export:** ProRes 422 HQ or High-bitrate H.264 (50+ Mbps)  

---

## Global Recording Settings (OBS)

```
Video:
  Base Resolution:     2560×1440
  Output Resolution:   2560×1440
  FPS:                 60
  Color Format:        NV12
  Color Space:         709
  Color Range:         Full

Output (Recording):
  Type:                Standard
  Format:              mov (ProRes) or mp4 (H.264)
  Encoder:             Apple ProRes 422 HQ / Apple H.264 (VideoToolbox)
  Bitrate:             100 Mbps (H.264) / Uncompressed (ProRes)
  Keyframe Interval:   2s
  Preset:              Quality
  Profile:             High

Audio:
  Sample Rate:         48 kHz
  Channels:            Stereo
  Desktop Audio:       DISABLED
  Mic/Aux:             DISABLED (Nico records VO separately)

Hotkeys:
  Start Recording:     ⌘⇧R
  Stop Recording:      ⌘⇧R
  Pause/Resume:        ⌘⇧P
```

---

## Browser Setup (Chrome/Edge — dedicated profile)

```
Profile: "GoalChain Demo Recording"
Window Size:           2560×1440 (full canvas)
Device Toolbar:        OFF
Extensions:            ALL DISABLED (especially ad blockers, password managers)
Bookmarks Bar:         HIDDEN (⌘⇧B)
Tabs:                  SINGLE TAB ONLY — close all others
Zoom:                  100% (⌘0)
Developer Tools:       CLOSED
Console:               CLEARED before each flow
Network Throttling:    OFF (full speed)
```

### Cursor Settings (for clarity)
- **Size:** Large (System Preferences → Accessibility → Display → Pointer size: Large)
- **Color:** High contrast yellow (#FFEB3B) with black outline
- **Click Effect:** Enable "Show pointer location on click" (OBS: Cursor plugin or macOS built-in)
- **Trails:** OFF

---

## Flow 1: Vercel Deploy Preview → Live URL

**Duration Target:** 30s raw footage → 15s in final cut  
**URL:** `https://goalchain-content-engine-<preview>.vercel.app` (use actual preview URL)

### Step-by-Step Actions

| Step | Action | Expected Result | Pause |
|------|--------|-----------------|-------|
| 1 | Open new tab → paste Vercel preview URL | Hero loads: "GoalChain Content Engine" + waitlist CTA | 3s |
| 2 | Scroll to "Deploy Status" section (if exists) | Green checkmark: "Deployed to Production" | 2s |
| 3 | Click "View Deployment" → Vercel dashboard | Vercel project page, recent deploy at top | 3s |
| 4 | Click deployment → "Visit" button | New tab: live production URL | 3s |
| 5 | Verify live URL loads identically | Same hero, same CTA, no console errors | 3s |
| 6 | Hover "Creator $39/mo" card | Tooltip expands with feature list | 2s |
| 7 | Click "Join Waitlist" | Modal opens smoothly | 2s |

### Visual Checkpoints (must be visible in recording)
- [ ] Vercel deployment URL in address bar
- [ ] Green "Production" badge on Vercel dashboard
- [ ] Live site loads without hydration errors
- [ ] Waitlist modal animation (fade + scale)
- [ ] No browser extensions visible in toolbar

### Retake Triggers
- Page load > 5s → retake
- Console errors visible → retake
- Wrong URL in address bar → retake
- Mouse cursor leaves canvas → retake

---

## Flow 2: Supabase Dashboard — Voice Profiles & Edge Functions

**Duration Target:** 45s raw footage → 20s in final cut  
**URL:** `https://supabase.com/dashboard/project/<project-id>`

### Pre-Recording Setup
1. Log into Supabase dashboard in demo profile
2. Navigate to Project → Table Editor
3. Have `voice_profiles` table visible with 2-3 demo rows
4. Have Edge Functions → Logs tab open in background tab

### Step-by-Step Actions

| Step | Action | Expected Result | Pause |
|------|--------|-----------------|-------|
| 1 | Click Table Editor → `voice_profiles` | Table loads: id, name, traits_json, created_at | 3s |
| 2 | Click row "Nico Analyst" → expand JSON | Traits visible: tone, vocabulary, emojis, hooks | 4s |
| 3 | Scroll to show `source_urls` array | 3 example URLs displayed | 2s |
| 4 | Switch tab → Edge Functions → `generate-content` | Function list visible | 2s |
| 5 | Click Logs → filter "last 5 min" | Recent invocations with status 200 | 3s |
| 6 | Click one log entry → expand | Request payload + response preview | 4s |
| 7 | Switch to Database → `generation_jobs` table | Jobs table: status, tokens_used, latency_ms | 3s |
| 8 | Click latest job → show `output_json` | Generated content preview | 3s |

### Visual Checkpoints
- [ ] Supabase project name visible in top bar
- [ ] Table Editor breadcrumb: `public` → `voice_profiles`
- [ ] JSON viewer expanded (not collapsed)
- [ ] Edge Function logs show 200 OK, latency < 2000ms
- [ ] Generation job shows `status: completed`
- [ ] **Blur/redact:** Project ID, API keys, real user emails, PII

### Retake Triggers
- Loading spinner > 3s → retake
- Redacted data accidentally visible → retake
- Wrong table selected → retake
- Log filter not applied → retake

---

## Flow 3: Generation API Call → JSON Response → Rendered Output

**Duration Target:** 40s raw footage → 18s in final cut  
**Tool:** Hoppscotch (web) or Postman (native) or curl in terminal (styled)

### Recommended: Hoppscotch (cleanest UI for recording)
**URL:** `https://hoppscotch.io` → Import collection → Run

### Pre-Recording Setup
1. Create Hoppscotch collection: "GoalChain Content Engine Demo"
2. Request: `POST https://api.goalchain.fun/v1/generate`
3. Headers: `Content-Type: application/json`, `Authorization: Bearer <demo-token>`
4. Body template ready with fixture_id, voice_profile_id, template_type
5. Response preview pane OPEN

### Step-by-Step Actions

| Step | Action | Expected Result | Pause |
|------|--------|-----------------|-------|
| 1 | Open Hoppscotch → select "Generate Match Preview" | Request panel visible | 2s |
| 2 | Show request body (JSON) | fixture_id, voice_profile_id, template: "match_preview" | 3s |
| 3 | Click "Send" → loading spinner | Spinner animates | 2s |
| 4 | Response appears → status 200 | JSON response with `content`, `tokens`, `latency_ms` | 4s |
| 5 | Click "Format JSON" / expand `content` | Rendered match preview text visible | 3s |
| 6 | Copy `content` → paste into side-by-side editor | Clean text, no markdown artifacts | 2s |
| 7 | Show character count → "278 chars (X limit)" | Counter updates live | 2s |

### Alternative: Terminal with `httpie` + `jq` (if preferred)
```bash
http POST https://api.goalchain.fun/v1/generate \
  Authorization:"Bearer $DEMO_TOKEN" \
  fixture_id="arg-vs-bra-2026-06-14" \
  voice_profile_id="nico-analyst" \
  template_type="match_preview" | jq .
```
**Recording:** Use `asciinema` or OBS window capture of terminal

### Visual Checkpoints
- [ ] Request URL clearly visible
- [ ] Authorization header present (token blurred)
- [ ] Response status: 200 OK
- [ ] JSON formatted, not minified
- [ ] `content` field expanded, readable
- [ ] No sensitive data in request/response

### Retake Triggers
- 4xx/5xx response → retake
- Token visible in clear → retake
- Response truncated → retake
- Network error → retake

---

## Flow 4: Waitlist Page — Tier Selection, Email Capture, Referral Link

**Duration Target:** 35s raw footage → 15s in final cut  
**URL:** `https://content.goalchain.fun` (production) or Vercel preview

### Pre-Recording Setup
1. Incognito/private window (clean cookies)
2. Viewport: 1440p, no browser chrome visible
3. Page pre-loaded, hero visible

### Step-by-Step Actions

| Step | Action | Expected Result | Pause |
|------|--------|-----------------|-------|
| 1 | Scroll to tier cards (Creator / Pro / Enterprise) | 3 cards, prices visible | 2s |
| 2 | Hover "Pro $97/mo" | Card lifts, border highlights, tooltip | 2s |
| 3 | Click "Select" on Pro tier | Card selected state (border + checkmark) | 2s |
| 4 | Click "Join Waitlist" → modal opens | Modal centered, backdrop blur | 2s |
| 5 | Type email: `demo+<timestamp>@goalchain.fun` | Keyboard visible, email validates | 3s |
| 6 | Click "Join Waitlist" → submit | Spinner → success toast | 3s |
| 7 | Success modal: "Referral link copied!" | Referral URL visible, copy button | 3s |
| 8 | Click "Copy" → toast "Copied to clipboard" | Clipboard confirmation | 2s |
| 9 | Click "Go to Dashboard" | Redirects to dashboard (empty state) | 3s |

### Visual Checkpoints
- [ ] Tier cards: Creator $39, Pro $97, Enterprise $2000
- [ ] Hover states work (transform + shadow)
- [ ] Email validation: green check on valid format
- [ ] Referral link format: `content.goalchain.fun?ref=<code>`
- [ ] Success toast auto-dismisses after 4s
- [ ] No console errors during flow

### Retake Triggers
- Modal animation janky → retake
- Email validation fails → retake
- Referral code not generated → retake
- Redirect fails → retake

---

## Recording Session Checklist

### Before Each Flow
- [ ] OBS recording test (10s) → play back, verify 1440p/60fps
- [ ] Browser profile clean, correct URL loaded
- [ ] Demo data seeded (voice profiles, waitlist tiers, API tokens)
- [ ] Mouse cursor settings verified
- [ ] Do Not Disturb ON (macOS: ⌥+click Notification Center)
- [ ] Screen recording permission granted to OBS

### During Recording
- [ ] Announce flow name at start: "Flow 1 — Vercel Deploy"
- [ ] Move mouse deliberately, pause on key UI states
- [ ] No keyboard shortcuts visible (use UI clicks)
- [ ] If mistake: pause (⌘⇧P), reset state, resume — don't stop recording

### After Each Flow
- [ ] Stop recording (⌘⇧R)
- [ ] Quick playback: verify last 5s captured
- [ ] Rename file: `flow-01-vercel-deploy-<timestamp>.mov`
- [ ] Note any retakes needed in log

---

## File Naming Convention

```
flow-01-vercel-deploy-20260610-143000.mov
flow-02-supabase-dashboard-20260610-143500.mov
flow-03-generation-api-20260610-144000.mov
flow-04-waitlist-tier-selection-20260610-144500.mov
```

---

## Backup Plan (if primary tool fails)

| Primary | Backup |
|---------|--------|
| OBS Studio | ScreenFlow (macOS native) |
| Hoppscotch | Postman / Insomnia / Terminal + httpie |
| Chrome Profile | Firefox Profile / Safari (clean) |

---

## Estimated Recording Time

| Flow | Setup | Recording | Retakes | Total |
|------|-------|-----------|---------|-------|
| 1. Vercel Deploy | 5 min | 1 min | 2 min | 8 min |
| 2. Supabase Dashboard | 5 min | 1.5 min | 2 min | 9 min |
| 3. Generation API | 5 min | 1 min | 2 min | 8 min |
| 4. Waitlist Page | 5 min | 1 min | 2 min | 8 min |
| **Total** | **20 min** | **4.5 min** | **8 min** | **~33 min** |

---

*End of Screen Recording Plan*  
*Manager (Hermes) · Director's Package v1.0*