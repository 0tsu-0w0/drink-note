import { Header } from "@/components/header";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "新規登録" };

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">新規登録</h1>
          </div>
          <div style={{ padding: 20 }}>
            <AuthForm mode="signup" />
          </div>
        </div>
        <p className="hint" style={{ marginTop: 18, lineHeight: 1.9 }}>
          記録はアカウントごとに分かれ、ほかの人からは見えません。
        </p>
      </main>
    </>
  );
}
