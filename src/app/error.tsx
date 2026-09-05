"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="single">
      <div className="panel">
        <div className="panel-head">
          <h1 className="panel-title">うまく表示できませんでした</h1>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ margin: "0 0 18px", color: "var(--ink-2)" }}>
            一時的な不具合の可能性があります。読み込み直しても直らない場合は、
            しばらく待ってからお試しください。記録は消えていません。
          </p>
          <div className="cta-row">
            <button type="button" className="submit" onClick={reset}>
              もう一度読み込む
            </button>
            <a href="/records" className="ghost">
              一覧へ戻る
            </a>
          </div>
          {error.digest && (
            <p className="hint" style={{ textAlign: "left", marginTop: 18 }}>
              参照番号: {error.digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
