/**
 * ログイン後などに飛ばす先を、自分のサイト内の path だけに絞る。
 *
 * 「/ で始まるか」だけでは足りない。`//evil.example` や `/\evil.example` は
 * / で始まるがブラウザは外部URLとして解釈するため、そのまま渡すと
 * 「ログインしたら知らないサイトに飛ばされる」踏み台になる。
 */
export function safeNextPath(value: unknown, fallback = "/records/new"): string {
  const v = typeof value === "string" ? value : "";
  if (!v.startsWith("/")) return fallback;
  /* プロトコル相対（//host）とバックスラッシュ変種を弾く */
  if (v.startsWith("//") || v.startsWith("/\\")) return fallback;
  /* 制御文字が混ざっていたら弾く */
  if (/[\u0000-\u001f\u007f]/.test(v)) return fallback;
  return v;
}
