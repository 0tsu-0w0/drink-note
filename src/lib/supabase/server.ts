import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * サーバー側の Supabase クライアント。
 * Server Component からは Cookie を書けないため、書き込みの失敗は握りつぶす。
 * セッションの更新は proxy.ts が担当する。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            /* Server Component からの書き込みは無視してよい */
          }
        },
      },
    },
  );
}
