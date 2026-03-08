# Vercel deploy — veri.fi

Use these settings so the build uses the monorepo correctly.

## Why deployment was failing (missing logic)

1. **Root Directory = `apps/web`** — Vercel then runs all commands *from* `apps/web`. The lockfile (`pnpm-lock.yaml`) and workspace root are in the **parent** (repo root), so a plain `pnpm install` or `npm run build` from `apps/web` either used the wrong package manager or couldn’t see the full workspace.
2. **Two separate steps** — If the dashboard overrode **Build Command** to `npm run build`, Vercel ran npm from `apps/web` after an install that might have been from root. So `next` wasn’t in the path or `node_modules` was in the wrong place.
3. **Fix** — Use a **single build command** that does both install and build from repo root: `cd ../.. && pnpm install && pnpm run build:web`. Install command is set to a no-op so only this one command does the work. No dependency on dashboard overrides.

---

## 1. Root Directory

**Must be:** `apps/web`

- Vercel Dashboard → your project → **Settings** → **General**
- **Root Directory** → Edit → set to **`apps/web`** → Save

## 2. Build & Development Settings

**Do not override** Install or Build. Let `apps/web/vercel.json` control them.

- **Settings** → **Build & Development Settings**
- **Install Command:** leave **empty** (or delete any override)
- **Build Command:** leave **empty** (or delete any override)
- **Output Directory:** leave default

So:
- **Install** = no-op (`true`) so Vercel doesn’t run a wrong install.
- **Build** = `cd ../.. && pnpm install && pnpm run build:web` (install + build from repo root in one step).

This way the **only** step that runs from repo root is the build command; it does both install and build in the same shell, so you never get “next: command not found” or “node_modules missing” from a mismatched install.

## 3. Package manager

Vercel should use **pnpm** because the repo has `pnpm-lock.yaml` at the repo root. With Root Directory = `apps/web`, the lock file is still in the cloned repo, so Vercel usually detects pnpm. If it uses npm, the custom `installCommand` in `vercel.json` forces `pnpm install`.

## 4. Redeploy

After changing settings: **Deployments** → **⋯** on latest → **Redeploy**, or push a new commit.

---

**If you still see "next: command not found" or "npm run build" in the logs:**

1. **Clear overrides** — Settings → Build & Development Settings → set **Build Command** and **Install Command** to **empty** (or delete overrides). This forces Vercel to use `apps/web/vercel.json`.
2. **Or set them explicitly** — If you prefer to see the commands in the dashboard, set:
   - **Install Command:** `cd ../.. && pnpm install`
   - **Build Command:** `cd ../.. && pnpm run build:web`
3. Confirm **Root Directory** is exactly `apps/web` (no leading slash).
4. Redeploy after saving.
