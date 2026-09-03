import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { RecordsView } from "@/components/records-view";
import type { DrinkRecord } from "@/lib/types";

export const metadata = { title: "これまでの一杯 — Sip Notes" };

export default async function RecordsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(2000);

  return (
    <>
      <Header email={user.email} />
      <main className="wrap" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
        {error ? (
          <p className="errbox">記録を読み込めませんでした：{error.message}</p>
        ) : (
          <RecordsView records={(data ?? []) as DrinkRecord[]} />
        )}
      </main>
      <div className="foot">
        <p>
          コーヒーの評価項目は<b>日本スペシャルティコーヒー協会（SCAJ）のカッピングフォーム</b>に倣っています。
          基礎点36点に8項目を各最大8点で加えて100点満点、<b>80点以上がスペシャルティコーヒー</b>の目安です。
        </p>
      </div>
    </>
  );
}
