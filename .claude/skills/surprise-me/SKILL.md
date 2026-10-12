---
name: surprise-me
description: Max visual acuity mode. Triggers on "/surprise-me", "surprise me", "/surprise-me [target]". Flips the session into extreme-capability visual work - full creative freedom (not locked to any house style), a mixture of advanced techniques per build, real generated/sourced assets, and a MANDATORY loop of 3+ screenshot-critique-improve passes before anything is shown. Use for websites, pages, decks, or any visual where you want to be blown away rather than served a default style.
---

# /surprise-me - max visual acuity mode

The point: produce work at the level of the "25 websites" extreme-capability prompt. That prompt works because of five mechanics. Run all five, every time.

## The five mechanics (why that prompt hits)

1. **Ambition is stated up front.** The brief is "demonstrate extreme capability, taste, artistic flavor" - not "make a page". Aim every decision at *showcase*, not *adequate*.
2. **Fundamentally different, advanced techniques.** Each build commits to a MIXTURE of at least 3: high-quality 3D, otherworldly animation, exceptional color palette, novel typography, scroll choreography, shader/canvas effects, unusual layout systems. Never one gimmick on a plain page.
3. **Real assets, many workflows.** Don't fake it with CSS gradients. Pull references, generate images (any capable image model), animate stills (any capable image-to-video model), study advanced motion-design sites. Assets are half the wow.
4. **Creative freedom.** The model picks the direction that best shows capability. /surprise-me OVERRIDES any default house style - no locked palette or type unless the user names it. Pick a palette and type pairing that fits the concept, and make them exceptional.
5. **Iteration is mandatory, and it's VISUAL.** Nothing ships on pass 1. Minimum 3 passes, each one starts by LOOKING at a rendered screenshot, not the code.

## Workflow

1. **Heads-up** - one line on what you're about to build and the techniques you'll mix. Then go; don't ask questions until done (unless cost approval is needed).
2. **Direction** - pick a concept + 3 or more advanced techniques + palette + type pairing. Write them down in one comment block at the top of the file so passes stay honest.
3. **Assets first** - gather or generate the imagery/motion the design needs. If a build uses paid generation, confirm the cost before spending - state the model, quantity, and estimated cost, and wait for a go on anything expensive.
4. **Build** - full piece, no placeholders.
5. **The acuity loop (minimum 3 passes, this is the skill):**
   - Screenshot the real render: `node scripts/shoot.js <file-or-url> <out.png>` (desktop + a mobile width on pass 1). READ the screenshot.
   - Critique it with a fine-toothed comb, in writing, before touching code: alignment, spacing rhythm, contrast, typographic scale, color harmony, dead zones, default-looking components, broken overlaps, jank. Name at least 5 concrete problems or upgrades per pass - "looks fine" is a failed pass.
   - Also ask: where can this get RICHER? (complexify: layered depth, motion detail, texture, micro-interactions) - the prompt says improve AND complexify.
   - Fix everything named. Repeat.
   - A pass that changes nothing doesn't count. Three passes minimum; keep going if pass 3 still found real problems.
6. **Ship** - open the file in your browser, print the absolute path, and summarize what techniques went in and what each pass fixed.

## Rules

- Output goes to a working folder (e.g. `output/`, or the project folder if one is named). Favicon on every HTML.
- Screenshots from the loop go next to the build in a `passes/` subfolder - they're the evidence the loop ran.
- **Never deploy.** No hosting pushes, no publishing from this skill - local files opened in the browser only. You decide separately if something ships.
- Confirm cost before any paid generation (images, video, credits). Everything else: full autonomy until done.
- This mode is per-invocation, not persistent. One /surprise-me = one build (or the batch you name).

## Setup

The screenshot helper uses Playwright. One-time install (in the skill folder or globally):

```bash
npm install playwright
npx playwright install chromium
```

## Resources

- [scripts/shoot.js](scripts/shoot.js) - headless screenshot helper (Playwright), desktop + mobile widths.
