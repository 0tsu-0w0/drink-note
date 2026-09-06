import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/records/new");

  const points = [
    {
      color: "var(--coffee)",
      title: "SCAJ のカッピングフォーム",
      body: "コーヒーは8項目を各1〜8点で採点し、基礎点36を足した100点満点。80点のスペシャルティ基準を引いたスコア推移が並びます。",
    },
    {
      color: "var(--alcohol)",
      title: "種類で変わる評価軸",
      body: "ワインは赤なら ボディ・渋み・酸味、白なら 酸味・香り・甘口度。ウイスキーもスコッチとバーボンで軸が入れ替わります。",
    },
    {
      color: "var(--food)",
      title: "ペアリングごと残す",
      body: "飲みものと、それに合わせた一品を同じ記録として結びます。あとから何と何が良かったかを辿れます。",
    },
    {
      color: "var(--green)",
      title: "素性を書き留める",
      body: "産地・農園・焙煎者・焙煎度、蔵元や造り手、場所まで。同じ豆をまた飲んだときの手がかりになります。",
    },
  ];

  return (
    <>
      <Header />
      <main className="single">
        <p className="lead">
          コーヒーも、茶も、お酒も。<br />
          どこの誰が作った一杯を、何と一緒に、どう味わったか。<br />
          一杯ずつ書き留めておくためのノートです。
        </p>
        <ul className="lede-list">
          {points.map((p) => (
            <li key={p.title}>
              <span className="mark" style={{ background: p.color }} />
              <span>
                <b>{p.title}</b>
                <br />
                {p.body}
              </span>
            </li>
          ))}
        </ul>
        <div className="cta-row">
          <Link href="/signup" className="submit">
            はじめる
          </Link>
          <Link href="/login" className="ghost">
            ログイン
          </Link>
        </div>
      </main>
      <div className="foot">
        <p>
          記録はアカウントごとに分かれ、ほかの人からは見えません。データベース側の行レベルセキュリティで、
          自分の行だけを読み書きできるように制限しています。
        </p>
      </div>
    </>
  );
}
