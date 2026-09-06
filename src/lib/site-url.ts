import { headers } from "next/headers";

/**
 * 確認メール・再設定メールのリンク先。
 *
 * 環境変数に頼ると、値が古いままでもビルドが通ってしまい、
 * 届いたメールのリンクだけが別のドメインを指す、という気づきにくい壊れ方をする。
 * 実際にアクセスされているドメインを最優先にして、それを避ける。
 *
 * ここで組み立てた URL は Supabase 側の Redirect URLs に登録されていなければ
 * 採用されない（登録が無ければ Supabase の Site URL に差し替えられる）ので、
 * ホストヘッダを信頼することによる踏み台化は起きない。
 */
export async function siteUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    /* headers() を使えない文脈では環境変数に頼る */
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  /* Vercel が自動で入れる本番ドメイン。設定を忘れていても効く。 */
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
