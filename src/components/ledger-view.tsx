"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AXIS_LABELS,
  CATS,
  CAT_KEYS,
  SPECIALTY,
  WD,
  axesFor,
  axisText,
  beanColor,
  catColor,
  catOf,
  dayKey,
  isFood,
  originOf,
  pad,
  scajTotal,
  styleLabel,
} from "@/lib/domain";
import { deleteRecord } from "@/app/actions";
import type { DrinkRecord } from "@/lib/types";

/* ================= 1件 ================= */
function Entry({
  e,
  isSub,
  inPair,
  onDelete,
  busy,
  confirming,
  onAskDelete,
  onCancelDelete,
}: {
  e: DrinkRecord;
  isSub: boolean;
  inPair: boolean;
  onDelete: (id: string) => void;
  busy: boolean;
  confirming: boolean;
  onAskDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  const d = new Date(e.recorded_at);
  const spec = axesFor(e.category, e.style);
  const total = scajTotal(e.category, e.axes);
  const st = styleLabel(e.category, e.style);
  const provItems = originOf(e.category).filter((f) => e.origin?.[f.k]);

  const seen = new Set<string>();
  const axParts: { label: string; text: string }[] = [];
  for (const it of spec.items) {
    const v = e.axes?.[it.k];
    if (!v) continue;
    seen.add(it.k);
    axParts.push({ label: it.label, text: total != null ? String(v) : axisText(it, v, spec.max) });
  }
  for (const [k, v] of Object.entries(e.axes ?? {})) {
    if (seen.has(k) || !v) continue;
    axParts.push({ label: AXIS_LABELS[k] ?? k, text: String(v) });
  }

  return (
    <div className={isSub ? "entry sub" : "entry"} style={{ ["--c" as string]: catColor(e.category) }}>
      <div className="time">
        {pad(d.getHours())}:{pad(d.getMinutes())}
      </div>
      <div className="main">
        <div className="nm">
          <span className="swatch" />
          <span className="title">{e.name}</span>
          <span className="catname">{catOf(e.category).label}</span>
          {st && <span className="stylename">{st}</span>}
          {e.rating ? <span className="rate">{"★".repeat(e.rating)}</span> : null}
          {total != null && (
            <span className={total >= SPECIALTY ? "scorebadge spec" : "scorebadge"}>SCAJ {total}</span>
          )}
          {inPair && !isSub && <span className="pairtag">ペア</span>}
        </div>
        {provItems.length > 0 && (
          <div className="prov">
            {provItems.map((f) => {
              const val = e.origin[f.k];
              const bean = f.beans ? beanColor(val) : null;
              return (
                <span key={f.k}>
                  {bean && <span className="bean" style={{ background: bean }} />}
                  {f.label} <b>{val}{f.unit ?? ""}</b>
                </span>
              );
            })}
          </div>
        )}
        {e.notes?.length > 0 && (
          <div className="flav">
            {e.notes.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        )}
        {axParts.length > 0 && (
          <div className="axline">
            {axParts.map((a) => (
              <span key={a.label}>
                {a.label} <b>{a.text}</b>
              </span>
            ))}
          </div>
        )}
        {e.memo && <div className="memo">{e.memo}</div>}
      </div>
      <div className="acts">
        {confirming ? (
          <>
            <span className="confirm-ask">本当に削除しますか</span>
            <button
              type="button"
              className="iconbtn danger"
              disabled={busy}
              onClick={() => onDelete(e.id)}
            >
              {busy ? "削除中…" : "削除する"}
            </button>
            <button type="button" className="iconbtn" disabled={busy} onClick={onCancelDelete}>
              やめる
            </button>
          </>
        ) : (
          <>
            <Link href={`/records/${e.id}/edit`} className="iconbtn">
              直す
            </Link>
            <button type="button" className="iconbtn danger" onClick={() => onAskDelete(e.id)}>
              削除
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= 本体 ================= */
export function LedgerView({ records }: { records: DrinkRecord[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"all" | "drink" | "food">("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtering = kind !== "all" || cat !== "all" || q.trim() !== "";

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return records.filter((e) => {
      if (kind === "drink" && isFood(e.category)) return false;
      if (kind === "food" && !isFood(e.category)) return false;
      if (cat !== "all" && e.category !== cat) return false;
      if (needle) {
        const hay = [
          e.name,
          e.memo ?? "",
          (e.notes ?? []).join(" "),
          Object.values(e.origin ?? {}).join(" "),
          catOf(e.category).label,
          styleLabel(e.category, e.style),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [records, kind, cat, q]);

  function onDelete(id: string) {
    startTransition(async () => {
      await deleteRecord(id);
      setConfirmId(null);
      router.refresh();
    });
  }

  /* 日付ごと → 同じ pair_id は1枚のカードへ */
  const groups: { k: string; d: Date; cards: DrinkRecord[][] }[] = [];
  for (const e of visible) {
    const k = dayKey(new Date(e.recorded_at));
    let g = groups.find((x) => x.k === k);
    if (!g) {
      g = { k, d: new Date(e.recorded_at), cards: [] };
      groups.push(g);
    }
    if (e.pair_id) {
      if (g.cards.some((c) => c[0].pair_id === e.pair_id)) continue;
      const members = visible.filter(
        (x) => x.pair_id === e.pair_id && dayKey(new Date(x.recorded_at)) === k,
      );
      g.cards.push([
        ...members.filter((m) => !isFood(m.category)),
        ...members.filter((m) => isFood(m.category)),
      ]);
    } else {
      g.cards.push([e]);
    }
  }

  return (
    <div className="stack">
      <div className="panel">
        <div className="panel-head">
          <h2 className="panel-title">これまでの一杯</h2>
          <span className="eyebrow">{visible.length}件</span>
        </div>
        <div className="filters">
          <div className="chips">
            {([["all", "すべて"], ["drink", "飲みもの"], ["food", "ペアリング"]] as const).map(([k, label]) => (
              <button key={k} type="button" className="chip sm" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {label}
              </button>
            ))}
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="カテゴリで絞り込む">
            <option value="all">カテゴリ：すべて</option>
            {CAT_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATS[k].label}
              </option>
            ))}
          </select>
          <div className="searchbox">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="名前・造り手・種類・補助情報・場所・メモ"
              aria-label="記録を検索"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="empty">
            {filtering ? (
              "この条件に合う記録はありません。"
            ) : (
              <>
                まだ一杯も記されていません。<Link href="/records/new">最初の一杯を記す</Link>ところから。
              </>
            )}
          </p>
        ) : (
          groups.map((g) => {
            const all = g.cards.flat();
            const drinkN = all.filter((e) => !isFood(e.category)).length;
            const foodN = all.length - drinkN;
            return (
              <div className="daygroup" key={g.k}>
                <div className="dayhead">
                  <div className="daydate">
                    {g.d.getMonth() + 1}月{g.d.getDate()}日<span className="wd">{WD[g.d.getDay()]}曜</span>
                  </div>
                  <div className="daysum">
                    {drinkN}杯{foodN > 0 ? ` ・ ${foodN}品` : ""}
                  </div>
                </div>
                {g.cards.map((members) => (
                  <div className={members.length > 1 ? "card paired" : "card"} key={members[0].id}>
                    {members.map((e, i) => (
                      <Entry
                        key={e.id}
                        e={e}
                        isSub={i > 0}
                        inPair={members.length > 1}
                        onDelete={onDelete}
                        busy={pending}
                        confirming={confirmId === e.id}
                        onAskDelete={setConfirmId}
                        onCancelDelete={() => setConfirmId(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
