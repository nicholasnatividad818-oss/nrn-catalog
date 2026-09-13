import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const ok = !!(url && key && !url.includes("YOUR_PROJECT") && !key.includes("YOUR_"));
  return { url, key, ok };
}

export async function createClient() {
  const { url, key, ok } = publicConfig();
  if (!ok || !url || !key) return null;
  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* Server Component — middleware refreshes session */
        }
      },
    },
  });
}

export function isSupabaseConfigured() {
  return publicConfig().ok;
}
