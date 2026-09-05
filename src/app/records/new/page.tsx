import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { RecordForm } from "@/components/record-form";
import type { Vocab } from "@/lib/domain";

export const metadata = { title: "一杯を記す", robots: { index: false, follow: false } };

export default async function NewRecordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("flavor_vocab").select("words").eq("user_id", user.id).maybeSingle();

  return (
    <>
      <Header email={user.email} />
      <main className="single" style={{ maxWidth: 560 }}>
        <RecordForm vocab={(data?.words ?? {}) as Vocab} />
      </main>
    </>
  );
}
