import Link from "next/link";
import { Header } from "@/components/header";

export const metadata = { title: "見つかりません" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">見つかりません</h1>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ margin: "0 0 18px", color: "var(--ink-2)" }}>
              お探しのページはありません。記録が削除されたか、URL が違うかもしれません。
            </p>
            <Link href="/records" className="ghost">
              一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
