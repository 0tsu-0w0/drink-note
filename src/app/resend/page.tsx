import { Header } from "@/components/header";
import { ResendConfirmationForm } from "@/components/reset-forms";

export const metadata = { title: "確認メールの再送" };

export default function ResendPage() {
  return (
    <>
      <Header />
      <main className="single">
        <div className="panel">
          <div className="panel-head">
            <h1 className="panel-title">確認メールの再送</h1>
          </div>
          <div style={{ padding: 20 }}>
            <ResendConfirmationForm />
          </div>
        </div>
      </main>
    </>
  );
}
