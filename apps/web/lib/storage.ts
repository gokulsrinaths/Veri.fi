/**
 * Upload proof image to Supabase Storage (proof-images bucket).
 * Returns public URL when Supabase is configured; otherwise returns null (caller uses data URL).
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const BUCKET = "proof-images";

export async function uploadProofImage(
  file: File,
  pathPrefix?: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = pathPrefix
    ? `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}
