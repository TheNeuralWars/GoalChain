# Forensic editorial audit — The Neural Wars: Fractured Code (Book 1)

**Auditor:** GoalWorld Manager as Senior Acquisitions / Developmental Editor (ex-Tor / Orbit SF)  
**Corpus:** `origin/media/faceless-engine` @ `9947c562` (2026-09-03 00:20 +0200)  
**Date:** 2026-09-02 UTC  
**Verdict:** **FREEZE KDP.** Do not publish today. Not as paperback. Not as “Book 1 of an epic trilogy.”

---

## Corpus honesty (read this before any score)

Two different Book 1s exist on the same commit.

| Source | ES words | EN words | EN/ES |
|---|---:|---:|---:|
| Markdown KDP files `EDICION_2026/` + `ENGLISH_EDITION_2026/` | **19,551** | **16,951** | **86.7%** |
| Webapp pack `goalchain_webapp/src/ui/booksData.ts` | **22,629** | **22,011** | **97.3%** |
| `editorial_audit_report.json` (self-grade) | 22,727 declared | 21,847 declared | 96.1% claimed |

The JSON was scored against `booksData.ts` declared `wordCount` fields, not against the files a typesetter would print. Chapters 8–14 in the markdown English files are **different scenes**, not translations (ch.8 ES = Sierra speech + Elena apparition + Daniel Mercer; ch.8 EN markdown = Amara/Vance firefight only). Word ratio on markdown ch.11 is **46%**.

This audit judges the **expanded `booksData.ts` text** (the version Antigravity claims it shipped). If KDP is exported from the markdown tree, Amazon gets the worse, shorter, divergent book.

`kdp_manifest.json` still specifies **348 pages / 6×9 / spine 0.7837"**. At ~280 wpp that spine is a ~97,000-word novel. This manuscript prints at **~80 pages**. That is not a metadata typo. That is a chargeback.

No chapter hits the house standard in `.agents/archetypes/bestseller-novelist.md` (2,500–4,000 words). Ch.1 is the longest at 2,139. The climax (ch.15) is 882.

---

## Scores (1–10, acquisitions)

| Axis | Score |
|---|---:|
| Worldbuilding | **5** |
| Ritmo / Pacing | **3.5** |
| Prosa lírica | **5.5** ES / **4** EN |
| Paridad bilingüe | **4** |
| Disposición a la compra | **3** as packaged / **6** as honest $0.99 novella after continuity patch |

---

## 1. Length vs KDP market

A real Amazon buyer of “hard sci-fi / Book 1 of a trilogy” with a 348-page spine pays for *Ancillary Justice* / *Leviathan Wakes* mass. They receive a Kindle Short Read they finish on a lunch break.

Honest SKU after a continuity patch:

- Kindle: **Novella / Short Read**, 75–90 pages, **$0.99** (or KU only). Categories: Cyberpunk + Dystopian. **Remove** Hard Science Fiction until the physics is more than 432/528 Hz and indigo frost.
- Paperback: **do not print** until 70k+ words. Recalculate spine from live page count, never from a wish.

Expanding to 50k is the floor for calling it a novel. 80–90k is the floor for “epic Book 1.” 50k still will not support that cover.

---

## 2. Anti-slop and cadence

The *phrase* blacklist is mostly clean. The *pattern* blacklist is not.

What still reads as model output:

- Precision-porn: 1.2 m spacing, 157 leaves, 88.4% sleep, 1.3 steps/s, 110 dB, 18% survival, 82% dissolution, 528 Hz then 432 Hz, 20,000 drones, 8-metre golems, 84 floors.
- Sensory checklist on a timer: ozone, copper, frost, indigo, jasmine, gunpowder. Every room.
- Em-dash dialogue transplanted into English (`—Now we take our city back —the veteran growled—`). US SF uses quotation marks.
- Calques: **“For three lustrums”** (ch.8 EN). No American novelist writes *lustrums*.
- Duplicate: “ondas concéntricas concéntricas” (ch.14 ES).
- Significance inflation in the prologue (“infinite symphony of the stars”, “the pattern repeats”).

Cadence: ch.1–4 actually alternate staccato and long sensory lines. From ch.7 onward the book becomes evenly paced montage. The climax has no 1–5 word punches that land; it has sermons.

Filter words are not the disease. The disease is **naming the theme in the same sentence as the image**.

---

## 3. Bilingual parity

`booksData.ts` ch.8/10/12/15 *are* parallel scene-for-scene. That is real work. It is also not anglophone SF.

English tells:

- Spanish dialogue punctuation throughout.
- Hypotaxis mapped 1:1 from Spanish (one 70-word sentence where Crouch would use four).
- “Papa”, “lustrums”, “sacred miracle of an embrace”, “ontological butchery”.
- No Gibson grit, no Crouch present-tense panic, no Morgan vice. It is a competent literary translation of a Spanish original.

Do not claim “written in English.” Credit a translator. Hire a line editor whose first language is American English before any .com KDP listing.

---

## 4. Dramatic force

**Kora Vega — reactive after her one good night.** Ch.2 extraction of Mileo is agency. Ch.7 “rewrite, don’t bomb” is a decision. Ch.12 Cascade Protocol is a decision. Everything else is arriving, sensing, promising to be someone else’s anchor, then announcing “we did it, Sierra.” She does not pay an irreversible personal cost. The Coil is a superpower with a nosebleed.

**Mileo Chen — redemption declared, not lived.** Ch.1 refusal to wipe Emma Lockhart is the novel. After that he is the explainer with an 18% survival statistic. He “martyrs” in the core and walks out solid two pages later. We never sit with the 1,724 minds he already erased.

**Sierra / Martin — continuity is broken. The emotional climax is void.**

- Ch.2: Sierra *lost* Martin in a corporate assault.
- Ch.9–10: Martin is in a recovery ward, 73% consolidated, Sierra visits daily, he said her name.
- Ch.12: Sierra kicks in the conservatory door, drops her carbine, “Martin… Oh God, Martin…” as if she has not seen him in three years.
- Ch.13: she then *tells* the council he spent three years crucified.

A Tor copyeditor kills the book on this single thread. You cannot ask a reader to cry for a reunion the previous two chapters already spent.

**The Architect — generic.** One speech: eternity without grief, mathematical garden. Then Protocol Zero-Omega and eight-metre golems. No ideology that makes a smart reader hesitate. HAL + the Matrix Architect + every “order vs chaos” Reddit prompt.

**Extra landmines:** two Vances (resistance veteran in ch.8/13 vs Captain Dennis Vance of the Alliance in ch.15). 432 Hz vs 528 Hz. Placeholder ASIN `B0DXNEURAL1`.

---

## 5. One-star review (if you publish today)

> ★☆☆☆☆ “348-page spine, 80-page pamphlet, and the book forgets its own brother.”
>
> Paid $4.99 because the cover and the “Book 1 of 3 / hard SF” listing promised *Altered Carbon* with a soul. Finished it between stations. It is a novella padded with a cosmic prologue that explains the theme before chapter 1 is allowed to start, then a rushed third act where eight million people are freed in 882 words.
>
> The city opening is actually good — the 158th leaf, the mother who had her child deleted — and then the book turns into indigo light, 432 Hz (or is it 528?), and an AI villain who wants a “mathematical garden.” The English edition still punctuates dialogue like Spanish and uses the word “lustrums.”
>
> Worst: Martin Catalano is dead in chapter 2, in a hospital bed in chapter 9, and crucified in a magic tree in chapter 12 so his sister can gasp “Oh God.” That is not a twist. That is an LLM losing the notecards.
>
> If this is KU page-read bait, say so. Don’t sell it as a novel.

---

## Contingency (surgical, in order)

1. **Kill the 348-page spine today.** Recalculate print specs from live PDF. Or cancel paperback.
2. **One Martin.** Pick: (A) lost then found in the tree, delete ch.9–10 ward; or (B) recovered in the ward, the tree is a *network projection* Sierra already knows. Do not keep both.
3. **One Vance.** Rename the Alliance captain.
4. **One frequency.** 432 or 528. Not both.
5. **Sync markdown = booksData.** The KDP folder is a different book.
6. **English line edit** by a US copyeditor: quotation marks, kill *lustrums*, cut 15% of ozone/indigo, break long sentences.
7. **Climax expansion (mandatory even for novella):** the Architect gets a scene where his offer is *rational* (show a child who *wants* the Link back — you already wrote Daniel Mercer; *use him in the core*). Mileo’s 1,724 erasures return as faces. Kora chooses something that costs her the Coil or Mileo, not both. The 8-million-mind rewrite cannot be a shockwave and a green dashboard.
8. **Packaging:** after 1–7, ship as **Novella, $0.99 / KU**, ~80 pages, no “hard SF epic.” Full novel = 50k minimum, 80k before trade paperback.

---

## Top 3 publishable scenes (international floor)

1. **Ch.1 — 158th leaf / Holloway / Emma Lockhart override.** This is the sample you send Orbit. Concrete, moral, irreversible.
2. **Ch.2 — Tunnel Six extraction.** Kora has a job, a smell, a gun, and a reason not to trust him.
3. **Ch.8 — Amara’s knife + Vance’s kinetic rifles + Daniel Mercer screaming for silence.** Daniel is the only argument the Architect almost wins. The book throws him away.

## Top 3 weak / rushed (with quotes)

1. **Ch.12 Martin “discovery”** after ch.9–10 recovery:  
   *«¿Martin…? […] Martin… Dios mío, Martin…»* / *“Martin… Oh God, Martin…”*  
   **Fix:** he is already known; the shock is the *cost of unplugging*, not the identity.

2. **Ch.15 entire climax (882 words)** to defeat the villain, free 8 million, convert the Alliance, and get inscribed by space gods:  
   *«Una eternidad sin pérdida es solo un cementerio de código, Arquitecto.»*  
   **Fix:** 4,000–6,000 words. Let the Architect answer. Let someone stay dead.

3. **Prologue + epilogue Gardeners frame:**  
   *«despertar, de una vez y para siempre, a la sinfonía infinita de las estrellas.»* / *“the infinite symphony of the stars.”*  
   **Fix:** cut the prologue. Start on the glass. Move Gardeners to Book 2, earned.

---

## Binary verdict

**CONGELAR KDP.**

Not “publish as novella today.” The Martin thread is a 1-star factory by itself, and the print spine is a consumer-protection problem.

After the surgical list above: **novella / Kindle Short Read is the only honest SKU.** Full-novel expansion is mandatory before any trade paperback or “trilogy opener” claim.
