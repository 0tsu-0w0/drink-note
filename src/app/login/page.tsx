import { Header } from "@/components/header";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "ログイン" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <>
      <Header />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">ログイン</h1>
          </div>
          <div style={{ padding: 20 }}>
            {error === "callback" && (
              <p className="errbox" style={{ marginTop: 0, marginBottom: 16 }}>
                確認リンクが無効か、期限が切れています。もう一度ログインをお試しください。
              </p>
            )}
            <AuthForm mode="login" next={next} />
          </div>
        </div>
      </main>
    </>
  );
}
