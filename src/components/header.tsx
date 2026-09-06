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
              <nav className="mainnav" aria-label="主な画面">
                <Link href="/records/new">記録する</Link>
                <Link href="/records">これまでの一杯</Link>
                <Link href="/insights">ふりかえり</Link>
              </nav>
              <div className="accountbar">
                <span className="who">{email}</span>
                <Link href="/reset/new">パスワード変更</Link>
                <form action={signOut}>
                  <button type="submit">ログアウト</button>
                </form>
              </div>
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
