"use client";
import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

export function supabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ok = !!(url && key && !url.includes("YOUR_PROJECT") && !key.includes("YOUR_"));
  return { url, key, ok };
}

export function createClient(): BrowserClient | null {
  const { url, key, ok } = supabasePublicConfig();
  if (!ok || !url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return supabasePublicConfig().ok;
}
