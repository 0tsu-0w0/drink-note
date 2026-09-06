"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, resendConfirmation, updatePassword } from "@/app/actions";
import type { ActionResult } from "@/lib/types";

/** 再設定メールを送ってもらう */
export function ResetRequestForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    requestPasswordReset,
    null,
  );
  /* 「送りました」は失敗ではなく案内として見せる */
  const isNotice = state && !state.ok && state.message.includes("送りました");

  return (
    <form action={formAction} className="composer-body" style={{ padding: 0, gap: 16 }}>
      {state && !state.ok && (
        <p className={isNotice ? "okbox" : "errbox"} role="status">
          {state.message}
        </p>
      )}
      <p className="hint" style={{ textAlign: "left", lineHeight: 1.8 }}>
        登録したメールアドレスに、パスワードを変えるためのリンクを送ります。
      </p>
      <div className="field">
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <button type="submit" className="submit" disabled={pending}>
        {pending ? "送信中…" : "再設定リンクを送る"}
      </button>
      <p className="hint">
        <Link href="/login">ログインに戻る</Link>
      </p>
    </form>
  );
}

/** 新しいパスワードを決める */
export function NewPasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updatePassword,
    null,
  );

  return (
    <form action={formAction} className="composer-body" style={{ padding: 0, gap: 16 }}>
      {state && !state.ok && (
        <p className="errbox" role="status">
          {state.message}
        </p>
      )}
      <div className="field">
        <label htmlFor="password">新しいパスワード</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <p className="hint" style={{ textAlign: "left" }}>8文字以上</p>
      </div>
      <div className="field">
        <label htmlFor="confirm">確認のためもう一度</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <button type="submit" className="submit" disabled={pending}>
        {pending ? "変更中…" : "パスワードを変える"}
      </button>
    </form>
  );
}

/** 確認メールの再送 */
export function ResendConfirmationForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    resendConfirmation,
    null,
  );
  const isNotice = state && !state.ok && /送り直しました|確認済み/.test(state.message);

  return (
    <form action={formAction} className="composer-body" style={{ padding: 0, gap: 16 }}>
      {state && !state.ok && (
        <p className={isNotice ? "okbox" : "errbox"} role="status">
          {state.message}
        </p>
      )}
      <p className="hint" style={{ textAlign: "left", lineHeight: 1.8 }}>
        登録したのに確認メールが届かない、リンクが開けない場合は、ここから送り直せます。
      </p>
      <div className="field">
        <label htmlFor="email">メールアドレス</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <button type="submit" className="submit" disabled={pending}>
        {pending ? "送信中…" : "確認メールを送り直す"}
      </button>
      <p className="hint">
        <Link href="/login">ログインに戻る</Link>
      </p>
    </form>
  );
}
