"use client";

import Link from "next/link";
import {
  CATS,
  CAT_KEYS,
  FAMILIES,
  FAM_KEYS,
  SPECIALTY,
  WD,
  catColor,
  dayKey,
  famOf,
  isFood,
  round1,
  scajTotal,
  type Family,
} from "@/lib/domain";
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
function Analysis({ records }: { records: DrinkRecord[] }) {
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

/* ================= 本体 ================= */
export function InsightsView({ records }: { records: DrinkRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="stack">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">ふりかえり</h2>
          </div>
          <p className="empty">
            まだ一杯も記されていません。<Link href="/records/new">最初の一杯を記す</Link>ところから。
          </p>
        </div>
      </div>
    );
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
        <Analysis records={records} />
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
    </div>
  );
}
