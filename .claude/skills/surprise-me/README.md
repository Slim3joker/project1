# surprise-me

Max visual acuity mode for your agent. One invocation flips the session into extreme-capability visual work: full creative freedom (no locked house style), a mixture of 3+ advanced techniques per build, real generated/sourced assets, and a mandatory loop of 3+ screenshot-critique-improve passes before anything is shown.

## Install

Unzip the file, then copy the `surprise-me/` folder into your skills directory:

```bash
cp -r surprise-me ~/.claude/skills/
```

Or project-specific: `cp -r surprise-me your-project/.claude/skills/`

## Triggers

- `/surprise-me [target]`
- "surprise me", "blow me away"

## Setup (optional)

The critique loop uses `scripts/shoot.js`, a headless screenshot helper. It needs Playwright:

```bash
npm install playwright
npx playwright install chromium
```

If your agent already has its own screenshot tool, the skill works without this - point the loop at that instead.

## What's inside

- `SKILL.md` - the five mechanics, the workflow, and the acuity-loop rules
- `scripts/shoot.js` - headless screenshot helper (desktop + mobile widths)

## License

CC BY 4.0 - free to use and adapt with attribution.
