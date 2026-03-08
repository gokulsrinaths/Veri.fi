# Supabase setup (one-time)

Your project is already in `.env`. Finish with these two steps.

---

## 1. Run the database schema

1. Open your Supabase SQL Editor:  
   **https://supabase.com/dashboard/project/uvgllsubavbzpthfwrll/sql/new**

2. Open the file **`supabase/schema.sql`** in this repo and copy its full contents.

3. Paste into the SQL Editor and click **Run**.

4. If you see an error about **storage.buckets** or permissions:
   - Go to **Storage** → **New bucket** → name: `proof-images`, set to **Public** → Create.
   - Then in **SQL Editor** run only the storage policies (the four `CREATE POLICY "..." ON storage.objects` lines from the bottom of `schema.sql`).

---

## 2. Restart the app

```bash
pnpm dev:web
```

Open http://localhost:3000. Create a task, submit proof — data and images will persist in Supabase.

---

**Done.** Tasks and submissions are stored in Supabase; proof images go to the **proof-images** bucket.
