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

/**
 * Compatibility helper for cleaning up Supabase auth cookies.
 *
 * v1.2.9 removed self-service account deletion, but an older orphaned
 * lib/actions/account-deletion.ts may still exist in repositories that were
 * updated by uploading/replacing files without deleting removed paths.
 * Keeping this helper exported is harmless for current code and prevents that
 * legacy file from breaking Next.js/TypeScript builds while operators finish
 * cleaning up the repository.
 */
export async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    const isSupabaseAuthCookie =
      cookie.name.startsWith("sb-") &&
      (cookie.name.includes("-auth-token") ||
        cookie.name.includes("-auth-token-code-verifier"));

    if (!isSupabaseAuthCookie) continue;

    try {
      cookieStore.delete(cookie.name);
    } catch {
      // Cookie writes are expected to run from a Server Action/Route Handler.
      // Swallowing here keeps the compatibility helper non-fatal if invoked
      // from a read-only server context.
    }
  }
}
