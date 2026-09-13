import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot always write cookies; proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}

export async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    const isSupabaseAuthCookie = cookie.name.startsWith("sb-") && (
      cookie.name.includes("-auth-token") ||
      cookie.name.includes("-auth-token-code-verifier")
    );
    if (!isSupabaseAuthCookie) continue;
    try {
      cookieStore.delete(cookie.name);
    } catch {
      // Called from a Server Action in the deletion flow, where cookie writes are allowed.
    }
  }
}
