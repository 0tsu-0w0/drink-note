"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AXIS_LABELS,
  CATS,
  CAT_KEYS,
  FAMILIES,
  FAM_KEYS,
  SPECIALTY,
  WD,
  axesFor,
  axisText,
  beanColor,
  catColor,
  catOf,
  dayKey,
  famOf,
  isFood,
  originOf,
  pad,
  round1,
  scajTotal,
  styleLabel,
  type Family,
} from "@/lib/domain";
import { deleteRecord } from "@/app/actions";
import type { DrinkRecord } from "@/lib/types";

/* ================= 帯 ================= */
function Strip({ records }: { records: DrinkRecord[] }) {
  const key = dayKey(new Date());
  const today = records.filter((e) => dayKey(new Date(e.recorded_at)) === key);
  const drinks = today.filter((e) => !isFood(e.category));
  const foods = today.length - drinks.length;
  const rated = today.filter((e) => e.rating);
  const avg = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : 0;

  const byFam = FAM_KEYS.map((f) => ({
    f,
    n: today.filter((e) => famOf(e.category) === f).length,
  })).filter((x) => x.n > 0);
  const maxN = Math.max(1, ...byFam.map((x) => x.n));

  return (
    <div className="strip">
      <div>
        <div className="k">今日の記録</div>
        <div className="big">
          {drinks.length}
          <small>杯</small>
          {foods > 0 && (
            <span style={{ color: "var(--food)" }}>
              {" "}
              +{foods}
              <small>品</small>
            </span>
          )}
        </div>
      </div>
      <div>
        <div className="k">好みの平均</div>
        <div className="big">
          {avg ? round1(avg) : "—"}
          {avg ? <small>/ 5</small> : null}
        </div>
      </div>
      <div className="mix">
        <div className="k" style={{ marginBottom: 2 }}>
          今日の内訳
        </div>
        {byFam.length ? (
          byFam.map((x) => (
            <div className="tline" key={x.f} style={{ ["--c" as string]: FAMILIES[x.f].color }}>
              <span className="k">{FAMILIES[x.f].label}</span>
              <span className="bar">
                <i style={{ width: `${(x.n / maxN) * 100}%` }} />
              </span>
              <span className="v">
                {x.n}
                <small>件</small>
              </span>
            </div>
          ))
        ) : (
          <div className="none">今日はまだ記録がありません</div>
        )}
      </div>
    </div>
  );
}

/* ================= 7日間のチャート ================= */
function WeekChart({ records }: { records: DrinkRecord[] }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const counts = Object.fromEntries(FAM_KEYS.map((f) => [f, 0])) as Record<Family, number>;
    for (const e of records) if (dayKey(new Date(e.recorded_at)) === k) counts[famOf(e.category)]++;
    days.push({ d, counts, total: FAM_KEYS.reduce((s, f) => s + counts[f], 0) });
  }
  const peak = Math.max(1, ...days.map((x) => x.total));
  const max = peak <= 4 ? 4 : Math.ceil(peak / 2) * 2;

  const W = 560, H = 188, padL = 30, padR = 10, padT = 14, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const band = plotW / 7, bw = Math.min(40, band * 0.5);
  const yOf = (v: number) => padT + plotH - (v / max) * plotH;

  return (
    <div className="chartbox">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="この7日間の1日あたりの記録数">
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={padL} y1={yOf(t)} x2={W - padR} y2={yOf(t)} stroke="var(--line)" strokeWidth={1} />
            <text className="axis-txt" x={padL - 7} y={yOf(t) + 3.5} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {days.map((day, i) => {
          const cx = padL + band * i + band / 2;
          let y = padT + plotH;
          const bars = FAM_KEYS.filter((f) => day.counts[f] > 0).map((f) => {
            const h = (day.counts[f] / max) * plotH;
            y -= h;
            return (
              <rect key={f} x={cx - bw / 2} y={y} width={bw} height={Math.max(h, 1)} fill={FAMILIES[f].color} opacity={0.88}>
                <title>{`${day.d.getMonth() + 1}月${day.d.getDate()}日 ${FAMILIES[f].label} ${day.counts[f]}件`}</title>
              </rect>
            );
          });
          const isToday = i === 6;
          return (
            <g key={i}>
              {bars}
              {day.total > 0 && (
                <text className="axis-txt" x={cx} y={y - 5} textAnchor="middle" fill="var(--ink-2)">
                  {day.total}
                </text>
              )}
              <text className={isToday ? "day-txt now" : "day-txt"} x={cx} y={H - 15} textAnchor="middle">
                {isToday ? "今日" : WD[day.d.getDay()]}
              </text>
              <text className="axis-txt" x={cx} y={H - 3} textAnchor="middle">
                {day.d.getMonth() + 1}/{day.d.getDate()}
              </text>
            </g>
          );
        })}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--line-strong)" strokeWidth={1} />
      </svg>
    </div>
  );
}

/* ================= 概要 ================= */
function Analysis({ records, filtered, hits }: { records: DrinkRecord[]; filtered: boolean; hits: number }) {
  if (filtered) {
    return (
      <div className="analysis">
        <p className="filtered">
          絞り込み中のため概要は伏せています。該当 <b>{hits}</b> 件
        </p>
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <div className="analysis">
        <p className="nodata">記録が貯まると、カテゴリごとの件数と好みの平均がここに並びます。</p>
      </div>
    );
  }
  const drinks = records.filter((e) => !isFood(e.category)).length;
  const pairs = new Set(records.filter((e) => e.pair_id).map((e) => e.pair_id)).size;
  const rows = CAT_KEYS.map((k) => {
    const list = records.filter((e) => e.category === k);
    const rated = list.filter((e) => e.rating);
    return {
      k,
      n: list.length,
      avg: rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : 0,
    };
  })
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...rows.map((x) => x.n));

  return (
    <div className="analysis">
      <div className="anum">
        <div>
          <span className="k">記録数</span>
          <span className="v">{records.length}</span>
        </div>
        <div>
          <span className="k">飲みもの</span>
          <span className="v">{drinks}</span>
        </div>
        <div>
          <span className="k">ペアリング</span>
          <span className="v">{records.length - drinks}</span>
        </div>
        <div>
          <span className="k">ペア記録</span>
          <span className="v">{pairs}</span>
        </div>
      </div>
      <div className="catrows">
        {rows.map((r) => (
          <div className="catrow" key={r.k} style={{ ["--c" as string]: catColor(r.k) }}>
            <span className="cname">{CATS[r.k].label}</span>
            <span className="cbar">
              <i style={{ width: `${(r.n / max) * 100}%` }} />
            </span>
            <span className="cn">{r.n}</span>
            <span className="cr">{r.avg ? `★${round1(r.avg)}` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= 味の記録 ================= */
function ScoreChart({ records }: { records: DrinkRecord[] }) {
  const scored = records
    .filter((e) => scajTotal(e.category, e.axes) != null)
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
    .slice(-12);

  if (scored.length === 0) {
    return (
      <p className="nodata">
        コーヒーを選んで8項目すべてに点を入れると、ここに100点法のスコアが並びます。基礎点36点＋各項目最大8点、80点以上がスペシャルティの目安です。
      </p>
    );
  }
  const vals = scored.map((e) => scajTotal(e.category, e.axes)!);
  const lo = Math.min(SPECIALTY - 6, Math.floor((Math.min(...vals) - 3) / 5) * 5);
  const hi = 100;
  const W = 460, H = 176, padL = 30, padR = 14, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const yOf = (v: number) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;
  const xOf = (i: number) => (scored.length === 1 ? padL + plotW / 2 : padL + (i / (scored.length - 1)) * plotW);

  return (
    <div className="chartbox" style={{ padding: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="コーヒーのカッピングスコアの推移" style={{ minWidth: 320 }}>
        {[lo, Math.round((lo + hi) / 2), hi].map((t) => (
          <g key={t}>
            <line x1={padL} y1={yOf(t)} x2={W - padR} y2={yOf(t)} stroke="var(--line)" strokeWidth={1} />
            <text className="axis-txt" x={padL - 7} y={yOf(t) + 3.5} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <line
          x1={padL} y1={yOf(SPECIALTY)} x2={W - padR} y2={yOf(SPECIALTY)}
          stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 3"
        />
        <text className="axis-txt" x={W - padR} y={yOf(SPECIALTY) - 5} textAnchor="end" fill="var(--accent)">
          スペシャルティ 80
        </text>
        {scored.length > 1 && (
          <path
            d={scored.map((_, i) => `${i ? "L" : "M"}${xOf(i)} ${yOf(vals[i])}`).join(" ")}
            fill="none" stroke="var(--coffee)" strokeWidth={1.6} strokeLinejoin="round"
          />
        )}
        {scored.map((e, i) => {
          const d = new Date(e.recorded_at);
          return (
            <g key={e.id}>
              <circle cx={xOf(i)} cy={yOf(vals[i])} r={4} fill="var(--coffee)">
                <title>{`${e.name} ${vals[i]}点`}</title>
              </circle>
              <text className="axis-txt" x={xOf(i)} y={yOf(vals[i]) - 9} textAnchor="middle" fill="var(--ink-2)">
                {vals[i]}
              </text>
              {(scored.length <= 8 || i % 2 === 0) && (
                <text className="axis-txt" x={xOf(i)} y={H - 8} textAnchor="middle">
                  {d.getMonth() + 1}/{d.getDate()}
                </text>
              )}
            </g>
          );
        })}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--line-strong)" strokeWidth={1} />
      </svg>
    </div>
  );
}

function FlavourRank({ records }: { records: DrinkRecord[] }) {
  const tally = new Map<string, { c: number; cats: Record<string, number> }>();
  for (const e of records) {
    for (const n of e.notes ?? []) {
      const t = tally.get(n) ?? { c: 0, cats: {} };
      t.c++;
      t.cats[e.category] = (t.cats[e.category] ?? 0) + 1;
      tally.set(n, t);
    }
  }
  const rows = [...tally.entries()]
    .sort((a, b) => b[1].c - a[1].c || a[0].localeCompare(b[0]))
    .slice(0, 8);

  if (rows.length === 0) {
    return (
      <p className="nodata">
        フレーバーノートを選んで記録すると、よく書いた言葉が多い順に並びます。自分で足した言葉も同じように数えます。
      </p>
    );
  }
  const max = rows[0][1].c;
  return (
    <div className="rank">
      {rows.map(([n, t]) => {
        const top = Object.keys(t.cats).sort((a, b) => t.cats[b] - t.cats[a])[0];
        return (
          <div className="rankrow" key={n} style={{ ["--c" as string]: catColor(top) }}>
            <span>{n}</span>
            <span className="rbar">
              <i style={{ width: `${(t.c / max) * 100}%` }} />
            </span>
            <span className="rn">{t.c}</span>
          </div>
        );
      })}
    </div>
  );
}

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
export function RecordsView({ records }: { records: DrinkRecord[] }) {
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
          <h2 className="panel-title">記録の推移</h2>
          <span className="eyebrow">直近7日間</span>
        </div>
        <Strip records={records} />
        <WeekChart records={records} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2 className="panel-title">記録の概要</h2>
          <span className="eyebrow">カテゴリ別の件数と平均</span>
        </div>
        <Analysis records={records} filtered={filtering} hits={visible.length} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2 className="panel-title">味の記録</h2>
          <span className="eyebrow">カッピングスコアとフレーバー</span>
        </div>
        <div className="taste">
          <div>
            <p className="subhead">コーヒーのカッピングスコア（SCAJ 100点法）</p>
            <ScoreChart records={records} />
          </div>
          <div>
            <p className="subhead">よく記したフレーバー</p>
            <FlavourRank records={records} />
          </div>
        </div>
      </div>

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
