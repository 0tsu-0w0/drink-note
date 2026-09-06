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

/**
 * 全ページに付ける保護のヘッダ。
 * script-src に 'unsafe-inline' を残しているのは、Next.js が水和のために
 * インラインの script を差し込むため。それでも接続先・埋め込み・フォームの
 * 送信先を絞れるので、入れる価値がある。
 */
const isProd = process.env.NODE_ENV === "production";

/* 開発モードの React はデバッグ機能で eval を使う。本番の React は使わない。 */
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const CSP = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  /* 他サイトの iframe に埋め込ませない（クリックジャッキング対策） */
  { key: "X-Frame-Options", value: "DENY" },
  /* Content-Type を推測させない */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* 外部へ送る Referer を絞る。記録の URL が漏れないように。 */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  /* HTTPS を強制する */
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  /* OGP画像の生成で読むフォントを、本番の実行環境にも同梱する */
  outputFileTracingIncludes: {
    "/og.png": ["./assets/**"],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
