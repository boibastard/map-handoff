// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment variables.");
}

if (!anon) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.");
}

export const supabase = createClient(url, anon);