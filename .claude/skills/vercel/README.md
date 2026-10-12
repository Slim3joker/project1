# vercel

A repeatable way for your agent to ship any local static site or toolkit to Vercel: a consistent project-naming convention (so every URL is predictable), a pre-flight checklist, and the exact deploy commands.

## Install

Unzip the file, then copy the `vercel/` folder into your skills directory:

```bash
cp -r vercel ~/.claude/skills/
```

Or project-specific: `cp -r vercel your-project/.claude/skills/`

You also need the Vercel CLI, logged in once: `npm i -g vercel` then `vercel login`.

## Triggers

- `/vercel`, "vercel this"
- "push to vercel", "deploy to vercel"

## What the checklist covers

- Deploy folder is self-contained (no `../` paths escaping the root)
- Minimal `vercel.json` with clean URLs + long cache headers for assets
- Favicon, title, description, og tags
- A no-secrets grep before every push
- Post-deploy 200 checks on the production URL

## What's inside

- `SKILL.md` - the naming rule, checklist, commands, and gotchas

## License

CC BY 4.0 - free to use and adapt with attribution.
