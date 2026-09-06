import Link from "next/link";
import { signOut } from "@/app/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header({ email }: { email?: string | null }) {
  return (
    <header className="masthead">
      <div className="masthead-in">
        <div>
          <Link href={email ? "/records/new" : "/"} className="wordmark">
            Sip <span>Notes</span>
          </Link>
          <p className="tagline">どこの誰が作った一杯を、何と一緒に、どう味わったか。</p>
        </div>
        <div className="masthead-right">
          <ThemeToggle />
          {email ? (
            <>
              <span className="who">{email}</span>
              <Link href="/records/new" className="iconbtn">
                記録する
              </Link>
              <Link href="/records" className="iconbtn">
                これまでの一杯
              </Link>
              <Link href="/reset/new" className="iconbtn">
                パスワード変更
              </Link>
              <form action={signOut}>
                <button type="submit" className="iconbtn">
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="iconbtn">
                ログイン
              </Link>
              <Link href="/signup" className="iconbtn">
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
