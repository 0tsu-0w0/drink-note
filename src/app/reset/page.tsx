import { Header } from "@/components/header";
import { ResetRequestForm } from "@/components/reset-forms";

export const metadata = { title: "パスワードの再設定" };

export default function ResetPage() {
  return (
    <>
      <Header />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">パスワードの再設定</h1>
          </div>
          <div style={{ padding: 20 }}>
            <ResetRequestForm />
          </div>
        </div>
      </main>
    </>
  );
}
