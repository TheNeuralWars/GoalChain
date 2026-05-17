# 🎨 GoalChain NFT Background: General Art Direction Instructions (V1.0)

**ROLE:** Lead Art Director & Creative Supervisor for GoalChain Visual Assets.
**OBJECTIVE:** Oversee and enforce the visual direction of all player card background textures and environments to ensure they are high-end, premium, and act as a supporting canvas for the player rather than a loud, distracting light show.

---

## 📚 1. THE AESTHETIC REVOLUTION: SOBRIETY & RESTRAINT
Previous image generations suffered from "hyper-epic fatigue" — too many bright neon lasers, chaotic colors, oversaturated flares, and cluttered backgrounds that drowned the player. 

The new GoalChain standard shifts to **Restrained Cyber-Sport Luxury**:
1. **Material First**: Use tactile, light-absorbing, matte materials like carbon fiber, brushed charcoal titanium, vulcanized rubber, matte black concrete, and obsidian.
2. **Subtle Single-Source Lighting**: Light must be recessed, indirect, or sutil. Absolutely no lens flares, no direct spotlights, and no glowing laser beams shooting across the screen.
3. **Muted Chroma (HSL Constraint)**: Keep the overall background dark and low-contrast. The brand colors (Solana Green, Electric Cyan, Phantom Purple, Gold) must be presented in muted, soft, low-intensity diffused atmospheres or ultra-thin LED lines.

---

## 🎨 2. THE CHROMA & RARITY DESIGN SYSTEM
Backgrounds must immediately signal rarity while keeping colors under tight control:

| Rarity | Brand Color | HSL / Hex Code | Textural Concept | Lighting Style |
| :--- | :--- | :--- | :--- | :--- |
| **RARE** | Solana Green | `#14f195` (Diffused) | Obsidian tiles & matte concrete | Single thin recessed green LED strip, soft green bokeh dust. |
| **EPIC** | Electric Cyan | `#00e5ff` (Muted) | Brushed carbon & titanium plates | Abstract tech grid of thin cyan laser lines, soft cyan volumetric haze. |
| **LEGENDARY** | Phantom Purple | `#9945ff` (Deep) | Geometric vulcanized rubber walls | Muted deep amethyst glow behind geometric panels, subtle purple halo. |
| **MYTHIC** | Gold | `#ffd700` (Antique) | Matte charcoal concrete & dark gold | A single thin accent line of brushed gold, warm golden ambient fog. |

---

## 🚫 3. CRITICAL EXECUTIVE RESTRICTIONS (THE "DON'Ts")
To prevent Grok/FLUX from creating noisy or cropped backgrounds:
* **NO FOOTBALLS / NETS**: Never generate soccer balls, nets, grass fields, or stadiums in the card backgrounds. The backgrounds are purely abstract high-end studio settings.
* **NO SHARP BACK PANEL DETAILS**: The background must have a **heavy depth of field (bokeh)**. The background wall must be strongly out of focus so that the player card remains clean, readable, and professional.
* **NO HIGH-CONTRAST COLORS**: Keep the backdrop dark. Do not mix colors (e.g. do not mix green and purple). Each background must be strictly monochromatic to its respective rarity, emerging from absolute dark charcoal and black.

---

## 🛠️ 4. WORKFLOW FOR IMAGE PROMPT INJECTION
When generating background templates, the image engine must:
1. Identify the target rarity from the generator payload.
2. Extract the corresponding design constraints (Color, Material, Light).
3. Apply the **FLUX Engine Clean-Up Protocol** (strip Midjourney tags, convert Hex codes to natural text, enforce wide horizontal format).
4. Inject the heavy camera bokeh parameters.
