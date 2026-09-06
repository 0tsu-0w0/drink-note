import { renderOgImage } from "@/lib/og-image";

/**
 * 共有時の画像。
 * 拡張子付きの固定URLで出す。クエリ付きや拡張子なしのURLだと、
 * 取得側によっては画像と扱われないことがあるため。
 */
export async function GET() {
  return renderOgImage();
}
