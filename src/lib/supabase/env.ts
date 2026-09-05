/**
 * Supabase の接続情報を読み出す。
 * 設定漏れは動かしてみるまで気づきにくいので、何をどこに入れるかまで書いて落とす。
 */
const HINT =
  "ローカルでは .env.local、Vercel では Settings → Environment Variables に設定し、" +
  "設定後は再デプロイしてください。値は Supabase の Settings → API にあります。";

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(`環境変数が設定されていません: ${missing.join(", ")}。${HINT}`);
  }
  return { url: url!, key: key! };
}
