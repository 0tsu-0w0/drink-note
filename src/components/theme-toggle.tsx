"use client";

import { useEffect, useState } from "react";

export const THEME_KEY = "sipnotes.theme";
type Theme = "system" | "light" | "dark";

const OPTIONS: { v: Theme; label: string; title: string }[] = [
  { v: "system", label: "自動", title: "端末の設定に合わせる" },
  { v: "light", label: "ライト", title: "常に明るい配色にする" },
  { v: "dark", label: "ダーク", title: "常に暗い配色にする" },
];

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.dataset.theme = theme;
}

export function ThemeToggle() {
  /* サーバー側では端末の設定を知りようがないので、選択状態は読み込み後に描く */
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let saved: Theme = "system";
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "light" || v === "dark") saved = v;
    } catch {
      /* 保存を読めない環境では自動のまま */
    }
    setTheme(saved);
    apply(saved);
  }, []);

  function choose(v: Theme) {
    setTheme(v);
    apply(v);
    try {
      if (v === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, v);
    } catch {
      /* 保存できなくても、その場の表示は切り替わる */
    }
  }

  return (
    <div className="themeseg" role="group" aria-label="配色">
      {OPTIONS.map((o) => (
        <button
          key={o.v}
          type="button"
          title={o.title}
          aria-pressed={theme === o.v}
          onClick={() => choose(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * React が動く前に配色を当てる。これが無いと、暗い配色を選んでいても
 * 読み込みの一瞬だけ明るい画面が出る。
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;
