# Vercel deploy — veri.fi

Use these settings so the build uses the monorepo correctly.

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
- Install = `pnpm install` (from `apps/web`, uses workspace)
- Build = `pnpm run build` (runs `next build` in `apps/web`)

## 3. Package manager

Vercel should use **pnpm** because the repo has `pnpm-lock.yaml` at the repo root. With Root Directory = `apps/web`, the lock file is still in the cloned repo, so Vercel usually detects pnpm. If it uses npm, the custom `installCommand` in `vercel.json` forces `pnpm install`.

## 4. Redeploy

After changing settings: **Deployments** → **⋯** on latest → **Redeploy**, or push a new commit.

---

**If you still see "next: command not found":**

- Confirm Root Directory is exactly `apps/web` (no leading slash).
- Confirm **Build Command** and **Install Command** in the dashboard are **empty** so `apps/web/vercel.json` is used.
- Confirm the latest commit with the updated `vercel.json` is deployed.
