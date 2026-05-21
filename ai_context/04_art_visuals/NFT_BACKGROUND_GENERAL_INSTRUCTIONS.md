# 🎨 GoalChain NFT Background: General Art Direction Instructions (V2.0)

**ROLE:** Lead Art Director & Creative Supervisor for GoalChain Visual Assets.
**OBJECTIVE:** Oversee and enforce the visual direction of all player card backgrounds. The backgrounds must represent imponente, futuristic, and monumental soccer stadiums at night, framed from a low-angle perspective showing the ground turf, while keeping color palettes restrained, dark, and highly professional to avoid distracting from the player card.

---

## 📚 1. THE MONUMENTAL FUTURISTIC STADIUM CONCEPT
Instead of abstract studio walls, backgrounds must represent the legendary cyber-sport arenas of GoalChain:
1. **Monumental Architecture**: Giant, curving, empty grandstands, sweeping structural arches, and futuristic open-roof structures made of matte charcoal concrete, carbon fiber, and dark glass.
2. **Low-Angle Perspective (Suelo Visible)**: The camera is positioned strictly at a low, ground-level angle. The foreground and lower-third of the frame must show highly-detailed textured dark turf/pitch grass, grounding the scene.
3. **Muted Sport-Chroma**: Keep the stadium dark and shadowed. The brand colors (Solana Green, Electric Cyan, Phantom Purple, Gold) must only outline the architectural arches with thin, sutil LED lines, and tint a soft volumetric mist rising from the pitch in the distance.
4. **Cinematic Bokeh**: The stadium structures in the distance must have a **heavy depth of field (bokeh)**, blurring them out beautifully so they act as a soft textured backdrop.

---

## 🎨 2. THE CHROMA & RARITY STADIUM SYSTEM
Backgrounds must immediately signal rarity using specific architectural lighting:

| Rarity | Brand Color | HSL / Hex Code | Stadium Concept | Lighting Style |
| :--- | :--- | :--- | :--- | :--- |
| **RARE** | Solana Green | `#14f195` (Muted) | Obsidian Arena | Thin green LED outlines on the main arch, soft green mist rising from the pitch. |
| **EPIC** | Electric Cyan | `#00e5ff` (Muted) | Aether Cyber-Dome | Soaring geodesic glass frame outlined with soft cyan LED contours, soft cyan volumetric haze. |
| **LEGENDARY** | Phantom Purple | `#9945ff` (Deep) | Carbon Monolith Dome | Muted purple atmospheric lighting under the stadium roof, subtle violet stadium aura. |
| **MYTHIC** | Gold | `#ffd700` (Antique) | Golden Olympus Arena | A single thin accent line of brushed gold running along the upper stadium structure, warm gold mist. |

---

## 📐 3. ASPECT RATIO & FRAMING PROTOCOL (MANDATORY 3:2 VERTICAL)
To fit the "Crypto-Panini" trading card template without any stretching or cropping:
1. **Vertical Composition**: The camera framing must be strictly vertical, capturing the colossal height of the stadium tiers extending upwards.
2. **Aspect Ratio**: Always specify a **3:2 vertical portrait format** (`aspect ratio 2:3` or parameter `--ar 2:3`).
3. **Turf Anchor**: The lower third of the vertical frame must remain a textured grass field, keeping the card design grounded.

---

## 🚫 4. CRITICAL EXECUTIVE RESTRICTIONS (THE "DON'Ts")
To prevent Grok/FLUX from creating bright, messy, or cluttered stadium images:
* **NO WIDESCREEN OR HORIZONTAL FORMATS**: Never generate horizontal or square formats. All prompts must explicitly request vertical portrait orientation.
* **NO CLASSIC FLOODLIGHTS**: Never generate giant white stadium floodlights pointing at the camera. All lights must be recessed, indirect, or sutil accent LEDs of the rarity color.
* **NO CROWDS**: The stadiums must be empty and silent. Do not generate crowds, spectators, or active games on the field.
* **NO OVERLY SATURATED BEAMS**: No bright laser beams or light spikes cutting through the sky. The light must be low-intensity and elegant.
* **MANDATORY GROUND (SUELO)**: The bottom of the image must always show the dark turf pitch, transitioning from slightly sharp in the close foreground to beautifully blurred in the mid-ground.
