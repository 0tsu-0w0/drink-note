import type { Metadata, Viewport } from "next";
import "./globals.css";
import { themeBootScript } from "@/components/theme-toggle";
import { siteUrl } from "@/lib/site-url";

const description =
  "どこの誰が作った一杯を、何と一緒に、どう味わったか。コーヒー・茶・お酒のテイスティングを書き留めるノートです。";

/**
 * og:url と og:image は実際にアクセスされているドメインから組み立てる。
 * 環境変数に頼ると、値が古いままでも画面は動くのに、共有したときだけ
 * 画像が出ない、という気づきにくい壊れ方をする。
 */
export async function generateMetadata(): Promise<Metadata> {
  const url = await siteUrl();
  return {
    metadataBase: new URL(url),
    title: { default: "Sip Notes", template: "%s — Sip Notes" },
    description,
    applicationName: "Sip Notes",
    openGraph: {
      type: "website",
      siteName: "Sip Notes",
      title: "Sip Notes",
      description,
      url,
      locale: "ja_JP",
    },
    twitter: { card: "summary_large_image", title: "Sip Notes", description },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E9EBE6" },
    { media: "(prefers-color-scheme: dark)", color: "#121513" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Shippori+Mincho+B1:wght@600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
