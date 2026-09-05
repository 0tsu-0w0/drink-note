import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { NewPasswordForm } from "@/components/reset-forms";

export const metadata = { title: "新しいパスワード", robots: { index: false, follow: false } };

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header email={user?.email} />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">新しいパスワード</h1>
          </div>
          <div style={{ padding: 20 }}>
            {user ? (
              <NewPasswordForm />
            ) : (
              <>
                <p className="errbox" style={{ marginTop: 0 }}>
                  リンクが無効か、有効期限が切れています。
                </p>
                <p className="hint" style={{ marginTop: 16 }}>
                  <Link href="/reset">もう一度メールを送る</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
