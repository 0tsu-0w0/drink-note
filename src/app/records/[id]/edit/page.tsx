import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { RecordForm } from "@/components/record-form";
import type { Vocab } from "@/lib/domain";
import type { DrinkRecord } from "@/lib/types";

export const metadata = { title: "記録を直す — Sip Notes" };

export default async function EditRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: record }, { data: vocabRow }] = await Promise.all([
    supabase.from("records").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("flavor_vocab").select("words").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!record) notFound();

  return (
    <>
      <Header email={user.email} />
      <main className="single" style={{ maxWidth: 560 }}>
        <RecordForm vocab={(vocabRow?.words ?? {}) as Vocab} record={record as DrinkRecord} />
      </main>
    </>
  );
}
