# Argon redesign brief (google/gemini-4-argon, included)

# GoalWorld Landing Page Redesign Brief
**Positioning:** Commercial Indie Arts & Gaming Studio ("Canon. Code. Cinema.")

---

### 1) CSS Token Changes
Transitioning from "Solana crypto-neon" to a refined, A24/Annapurna-inspired dark editorial palette. Keep `Outfit` for UI/headings, but introduce a serif for literary authority and monospace for technical metadata.

*   **Backgrounds:**
    *   `--bg-canvas`: `#030307` → `#0A0B0E` (Softer, richer obsidian)
    *   `--bg-surface`: `#0d0d14` → `#12141C` (Card base)
    *   `--bg-elevated`: `#161622` → `#191C26` (Hover states / Modals)
*   **Typography:**
    *   `--font-display`: `'Outfit', sans-serif` (Keep for UI/Headers, reduce tracking to `-0.02em`)
    *   `--font-editorial`: `'Newsreader', 'Instrument Serif', serif` (New: Book titles, lore pull-quotes)
    *   `--font-mono`: `'JetBrains Mono', monospace` (New: Tags, Devnet badges, Roadmap status)
    *   `--text-primary`: `#FFFFFF` → `#F4F4F6` (Off-white to reduce halation)
    *   `--text-secondary`: `#8A8F9E` → `#9CA3AF`
    *   `--text-muted`: `#5E6472`
*   **Accents (Killing the Green/Cyan/Purple Gradient):**
    *   `--accent-primary`: `#E5A93C` (Warm Amber/Gold — literary, cinematic primary CTA)
    *   `--accent-code`: `#3B82F6` (Clean Cobalt — replaces Solana neon for Play/Devnet tags)
    *   `--accent-cinema`: `#E11D48` (Crimson — subtle indicator for video/rec)
*   **Borders & Effects:**
    *   `--border-subtle`: `rgba(255, 255, 255, 0.08)` (Replaces neon glowing borders)
    *   `--border-focus`: `rgba(229, 169, 60, 0.4)`
    *   `--shadow-glow`: `none` (Remove all neon `drop-shadow` and `box-shadow` utilities)

---

### 2) Hero Hierarchy & Exact Copy
**Layout:** Asymmetric 60/40 split on desktop. Left: Typography & CTAs. Right: High-res composite visual featuring the *Fractured Code* book cover in the foreground, subtly backed by a muted loop of the AI cinema trailer.

*   **Eyebrow (Mono, `--accent-primary`):** `GOALWORLD STUDIO // CANON. CODE. CINEMA.`
*   **H1 (Display + Editorial Serif mix):** `One Universe. Three Mediums.`
*   **Subhead (`--text-secondary`, max-width 54ch):** `Home to The Neural Wars sci-fi saga, experimental AI filmmaking, and the GoalChain Matchday tactical sandbox.`
*   **Book 2 Micro-Banner (Pill badge below CTAs, `--bg-surface` with `--border-subtle`):** 
    *   *Copy:* `COMING SOON: Book 2, "Earth’s New Song" is officially signed. [Get Notified →]` *(Triggers lightweight email capture modal).*

---

### 3) CTA Order & Styling
Replace the three equal-weight buttons with a strict visual hierarchy:

1.  **Primary CTA (Solid `--accent-primary` fill, dark text `#0A0B0E`, prominent):**
    *   `Read "Fractured Code" — Free` *(Sub-label in button or tooltip: `Book 1 Web Reader`)*
2.  **Secondary CTA (`--bg-elevated`, `1px solid --border-subtle`, `--text-primary`):**
    *   `Play Matchday Demo` *(Include a subtle mono badge inside: `DEVNET`)*
3.  **Tertiary CTA (Text-only link with play icon, `--text-secondary`, hover to `--text-primary`):**
    *   `▶ Watch AI Cinema` *(Smooth scrolls to Cinema section)*

---

### 4) Section Order (Cuts & Merges)
Streamlining from 7 disjointed sections to 5 cohesive narrative blocks.

1.  **Hero Section** (Includes Book 2 notification trigger)
2.  **The Studio Pillars (Merged):** Combine *"Pick your door" (4 cards)* and *"Lore band"* into a **3-Card Bento Grid** (Canon, Code, Cinema). Cut the 4th redundant card.
3.  **Featured Canon: *The Neural Wars* (New Focus Block):** Dedicated spotlight on Book 1 (Free Reader) and Book 2 (*Earth's New Song* email capture), absorbing the narrative weight of the old Lore band.
4.  **Cinema & Code Showcase (Merged & Trimmed):** 
    *   *Left/Top:* **AI Cinema** (1 featured trailer player + 3 compact film-draft thumbnails).
    *   *Right/Bottom:* **GoalChain Play / Matchday**. **CUT** the 4-step "How to Play" section from the landing page (move it inside the game UI). Replace with a clean feature card explaining the free-to-play Solana Devnet sandbox.
5.  **Studio Roadmap** (Rewritten Now / Next / Later)
6.  **Community & Footer** (Condensed into a clean, single-band newsletter + social/Discord footer).

---

### 5) Copy Deltas Per Section

*   **Section 2: The 3 Pillars (formerly 4-Card "Pick Your Door")**
    *   *Delta:* Drop crypto jargon; frame as an interdisciplinary entertainment studio.
    *   *Card 1 (Canon):* **The Neural Wars.** Hard sci-fi exploring consciousness and control. Read Book 1, *Fractured Code*, free in your browser today.
    *   *Card 2 (Code):* **GoalChain Matchday.** A tactical football simulation running on Solana Devnet. Pure strategy—no real money, no financial risk.
    *   *Card 3 (Cinema):* **Visual R&D.** Bringing our literary canon to life through generative AI trailers, animatics, and experimental film drafts.
*   **Section 3: Book 2 Callout (Inside Featured Canon)**
    *   *Headline:* `Next in the Saga: "Earth's New Song"`
    *   *Copy:* `Book 2 of The Neural Wars is signed and in production. Join the studio dispatch to get notified the moment it releases.`
    *   *Input CTA:* `Notify Me on Release` (Strictly avoid "Pre-order" or retailer names).
*   **Section 4: GoalChain Matchday (Replacing 4-Step How-To-Play)**
    *   *Headline:* `Tactical Football on the Testnet.`
    *   *Copy:* `Experience the Matchday alpha. Draft lineups, test match engine logic, and compete on the leaderboard using free Devnet tokens. Built for gameplay testing, entirely free to play.`

---

### 6) Roadmap Rewrite
Removed all references to royalty tokenization, vaults, yield, and token sales. Reframed around creative production and software milestones.

*   **NOW // Live & Playable**
    *   **Canon:** *Fractured Code* (Book 1 of *The Neural Wars*) live in the free web reader.
    *   **Code:** GoalChain Matchday playable demo live on Solana Devnet (sandbox mode).
    *   **Cinema:** Official *Neural Wars* concept trailer and initial AI film-draft clips released.
*   **NEXT // In Production**
    *   **Canon:** Editorial completion and release preparation for Book 2, *Earth’s New Song* (signed).
    *   **Code:** Matchday core loop upgrades—enhanced match simulation telemetry and UI overhaul.
    *   **Cinema:** Extended narrative shorts adapting key chapters from *Fractured Code*.
*   **LATER // Studio Horizon**
    *   **Canon:** Expansion of *The Neural Wars* universe with supplemental lore archives and audio formats.
    *   **Code:** Cross-title profile progression linking reader milestones with in-game Matchday cosmetics.
    *   **Cinema:** Long-form episodic AI animation pipeline and community screening events.
