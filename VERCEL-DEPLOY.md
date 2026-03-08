# Vercel deploy — veri.fi

## Critical: Root Directory must be `apps/web`

The error `packages/shared build$ tsup` and `next: command not found` means **Root Directory is set to the repo root** (or empty). Vercel then runs `npm run build` at root, which builds ALL packages (including packages/shared) instead of only the web app.

**Fix:** Set **Root Directory** to **`apps/web`** in Vercel:

1. Vercel Dashboard → your project → **Settings** → **General**
2. **Root Directory** → Edit → type **`apps/web`** (no leading slash) → Save
3. **Redeploy**

---

## If Root Directory is repo root (fallback)

A `vercel.json` at repo root sets `installCommand: pnpm install` and `buildCommand: pnpm run build:web` so only the web app is built (not packages/shared). But **Next.js deployment works best when Root Directory = apps/web**. Prefer that.

---

## Build & Development Settings

**Clear any overrides** so vercel.json is used:

- **Settings** → **Build & Development Settings**
- **Install Command:** leave **empty**
- **Build Command:** leave **empty**

When Root Directory = `apps/web`, `apps/web/vercel.json` uses:
- **Install:** no-op
- **Build:** `cd ../.. && pnpm install && pnpm run build:web`

---

## Redeploy

After changing settings: **Deployments** → **⋯** on latest → **Redeploy**, or push a new commit.
