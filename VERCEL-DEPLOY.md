# Vercel deploy — veri.fi

## Root Directory must be `apps/web`

Set **Root Directory** to **`apps/web`** so Vercel builds only the Next.js app:

1. Vercel Dashboard → your project → **Settings** → **General**
2. **Root Directory** → Edit → **`apps/web`** (no leading slash) → Save
3. Redeploy

---

## Install and build (no pnpm — avoids registry errors)

`apps/web` includes a **package-lock.json** and **vercel.json** so Vercel uses **npm** instead of pnpm. That avoids `ERR_PNPM_META_FETCH_FAIL` / `ERR_INVALID_THIS` on the npm registry.

- **Install:** `npm install`
- **Build:** `npm run build`

Leave **Install Command** and **Build Command** empty in the dashboard so this config is used.

---

## If you changed overrides

Clear them: **Settings** → **Build & Development Settings** → leave Install and Build **empty**, then redeploy.
