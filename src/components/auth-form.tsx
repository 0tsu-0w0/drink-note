"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions";
import type { ActionResult } from "@/lib/types";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  /* 新規登録で確認メールを送った場合は、失敗ではなく案内として見せる */
  const isNotice = mode === "signup" && state && !state.ok && state.message.includes("確認メール");

  return (
    <form action={formAction} className="composer-body" style={{ padding: 0, gap: 16 }}>
      {state && !state.ok && (
        <p className={isNotice ? "okbox" : "errbox"} role="status">
          {state.message}
        </p>
      )}
      <input type="hidden" name="next" value={next ?? "/records"} />
      <div className="field">
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
        {mode === "signup" && <p className="hint" style={{ textAlign: "left" }}>8文字以上</p>}
      </div>
      <button type="submit" className="submit" disabled={pending}>
        {pending ? "送信中…" : mode === "login" ? "ログイン" : "登録する"}
      </button>
      {mode === "login" ? (
        <div className="authlinks">
          <Link href="/reset">パスワードを忘れた</Link>
          <Link href="/resend">確認メールが届かない</Link>
          <Link href="/signup">新規登録はこちら</Link>
        </div>
      ) : (
        <div className="authlinks">
          <Link href="/login">すでにお持ちの方はログイン</Link>
          <Link href="/resend">確認メールが届かない</Link>
        </div>
      )}
    </form>
  );
}
