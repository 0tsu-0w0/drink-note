import type { NextConfig } from "next";

/**
 * 本番ビルド時に接続情報が無ければ、ここで止める。
 * 通ってしまうとデプロイは成功するのに、開いた瞬間に全ページが落ちる。
 */
if (process.env.NODE_ENV === "production") {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    throw new Error(
      `環境変数が設定されていません: ${missing.join(", ")}\n` +
        "Vercel では Settings → Environment Variables に追加してから再デプロイしてください。\n" +
        "値は Supabase の Settings → API にあります（Project URL と anon / publishable key）。",
    );
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn(
      "[Sip Notes] NEXT_PUBLIC_SITE_URL が未設定です。" +
        "確認メールと再設定メールのリンクが localhost を指してしまいます。",
    );
  }
}

const nextConfig: NextConfig = {};

export default nextConfig;
