---
name: vercel
description: Deploy any local static site or toolkit to Vercel with a consistent project-naming convention and a repeatable pre-flight checklist. Triggers on "push to vercel", "deploy to vercel", "/vercel", "vercel this".
---

# Vercel Deploys

A repeatable way to ship a local static site or toolkit to Vercel, so every URL is predictable and every deploy passes the same checks.

## The naming rule

Pick one project-name convention and hold to it so URLs read the same every time:

```
<prefix>-<name-of-toolkit>.vercel.app
```

Use a short prefix you own (your brand, org, or initials), then a kebab-case toolkit name. Examples: `acme-design-systems`, `acme-color-palettes`. Never accept a random Vercel-generated name or suffix. Kebab-case, drop filler words, keep it short but readable.

## Pre-flight checklist (before every deploy)

1. **Deploy folder is self-contained** - all asset paths resolve inside the folder (no `../` escaping the deploy root). Test locally with a static server first if unsure.
2. **vercel.json** - minimal static config; add `cleanUrls: true` and long cache headers for `/assets/`:
   ```json
   { "cleanUrls": true, "headers": [ { "source": "/assets/(.*)", "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] } ] }
   ```
3. **Dark/light toggle** - if the site has one, default it sensibly and persist the choice in `localStorage` so a reload keeps it.
4. **Favicon + meta** - inline SVG favicon, title, description, og tags.
5. **No secrets** - grep the folder for keys/tokens before pushing. Never deploy a `.env`, a private key, or an access token.

## Deploy commands

Log in once with `vercel login`. Then, from the deploy folder:

```bash
cd <deploy-folder>
vercel deploy --prod --yes --name <prefix>-<toolkit-name>
```

If `--name` is deprecated on your installed CLI version, link explicitly first:

```bash
vercel link --yes --project <prefix>-<toolkit-name>
vercel deploy --prod --yes
```

The first deploy creates the project with that name; later deploys from the same folder reuse the link in `.vercel/`.

## After deploying

1. `curl -s -o /dev/null -w "%{http_code}"` the production URL (and a couple of subroutes) - expect 200s.
2. Report the URL back.

## Gotchas

- A folder already containing `.vercel/` is linked to an EXISTING project - check `cat .vercel/project.json` before deploying so you do not push a new toolkit over an old project.
- Deploy folders assembled from multiple sources (site + shared assets) should be built by a script so re-assembly is reproducible.
- The free tier file limit is generous but keep videos small.
