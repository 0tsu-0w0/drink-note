"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AXES,
  CAT_KEYS,
  CATS,
  SPECIALTY,
  axesFor,
  beanColor,
  catColor,
  famOf,
  flavorsOf,
  isFood,
  isKnownNote,
  originOf,
  scajTotal,
  stylesOf,
  toLocalInput,
  type AxisItem,
  type AxisSpec,
  type Category,
  type Vocab,
} from "@/lib/domain";
import { createRecord, saveVocab, updateRecord } from "@/app/actions";
import type { DrinkRecord, PairingInput } from "@/lib/types";

type Props = { vocab: Vocab; record?: DrinkRecord };

function Stars({
  value,
  onChange,
  mini,
}: {
  value: number;
  onChange: (n: number) => void;
  mini?: boolean;
}) {
  return (
    <div className={mini ? "stars mini" : "stars"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? "star on" : "star"}
          aria-label={`好み${n}`}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
      {!mini && (
        <button type="button" className="star-clear" onClick={() => onChange(0)}>
          消す
        </button>
      )}
    </div>
  );
}

function Axes({
  spec,
  values,
  onChange,
}: {
  spec: AxisSpec;
  values: Record<string, number>;
  onChange: (k: string, v: number) => void;
}) {
  const nums = Array.from({ length: spec.max }, (_, i) => i + 1);
  return (
    <div className="axes">
      {spec.items.map((it: AxisItem) => (
        <div key={it.k}>
          <div className="axis">
            <span className="axname">{it.label}</span>
            <div className="seg" role="group" aria-label={it.label}>
              {nums.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={values[it.k] === n}
                  title="もう一度押すと未評価に戻ります"
                  onClick={() => onChange(it.k, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {it.poles && (
            <div className="axis">
              <span />
              <div className="poles" style={{ gridColumn: "auto" }}>
                <span>{it.poles[0]}</span>
                <span>{it.poles[1]}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function RecordForm({ vocab: initialVocab, record }: Props) {
  const router = useRouter();
  const editing = !!record;

  const [cat, setCat] = useState<Category>((record?.category as Category) ?? "coffee");
  const [style, setStyle] = useState<string>(record?.style ?? "");
  const [name, setName] = useState(record?.name ?? "");
  const [origin, setOrigin] = useState<Record<string, string>>(record?.origin ?? {});
  const [when, setWhen] = useState(toLocalInput(record ? new Date(record.recorded_at) : new Date()));
  const [rating, setRating] = useState(record?.rating ?? 0);
  const [notes, setNotes] = useState<string[]>(record?.notes ?? []);
  const [axes, setAxes] = useState<Record<string, number>>(record?.axes ?? {});
  const [memo, setMemo] = useState(record?.memo ?? "");
  const [vocab, setVocab] = useState<Vocab>(initialVocab);
  const [noteDraft, setNoteDraft] = useState("");
  const [withPairing, setWithPairing] = useState(false);
  const [pairings, setPairings] = useState<PairingInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const color = catColor(cat);
  const spec = useMemo(() => axesFor(cat, style), [cat, style]);
  const originFields = useMemo(() => originOf(cat), [cat]);
  const styleList = stylesOf(cat);
  const fam = famOf(cat);
  const mine = vocab[fam] ?? [];
  const total = scajTotal(cat, axes);
  const doneAxes = spec.items.filter((it) => axes[it.k]).length;

  function changeCat(next: Category) {
    setCat(next);
    setStyle("");
    setAxes({});
    setNotes([]);
    setOrigin({});
    if (isFood(next)) {
      setWithPairing(false);
      setPairings([]);
    }
  }

  function toggleAxis(k: string, v: number) {
    setAxes((prev) => {
      const out = { ...prev };
      if (out[k] === v) delete out[k];
      else out[k] = v;
      return out;
    });
  }

  function toggleNote(n: string) {
    setNotes((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  function commitNote() {
    const v = noteDraft.trim();
    if (!v) return;
    if (!isKnownNote(cat, v, vocab)) {
      const nextVocab: Vocab = { ...vocab, [fam]: [...(vocab[fam] ?? []), v] };
      setVocab(nextVocab);
      void saveVocab(nextVocab);
    }
    setNotes((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setNoteDraft("");
  }

  function dropVocab(n: string) {
    const nextVocab: Vocab = { ...vocab, [fam]: (vocab[fam] ?? []).filter((x) => x !== n) };
    setVocab(nextVocab);
    void saveVocab(nextVocab);
  }

  function patchPairing(i: number, patch: Partial<PairingInput>) {
    setPairings((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function submit() {
    setError(null);
    if (!name.trim()) {
      setError("名前を入れてください。");
      return;
    }
    startTransition(async () => {
      const payload = {
        id: record?.id,
        category: cat,
        style,
        name,
        recordedAt: new Date(when).toISOString(),
        origin,
        rating,
        axes,
        notes,
        memo,
        pairings: withPairing ? pairings : [],
      };
      const res = editing ? await updateRecord(payload) : await createRecord(payload);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push("/records");
      router.refresh();
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h1 className="panel-title">{editing ? "記録を直す" : "一杯を記す"}</h1>
        <span style={{ display: "flex", gap: 6 }}>
          <Link href="/records" className="iconbtn">
            これまでの一杯
          </Link>
          <Link href="/insights" className="iconbtn">
            ふりかえり
          </Link>
        </span>
      </div>

      <div className="composer-body" style={{ ["--cat" as string]: color }}>
        {error && <p className="errbox">{error}</p>}

        <div className="field">
          <span className="flabel" id="lbl-category">カテゴリ</span>
          <div className="chips" role="group" aria-labelledby="lbl-category">
            {CAT_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                className="chip sm"
                style={{ ["--cat" as string]: catColor(k) }}
                aria-pressed={cat === k}
                onClick={() => changeCat(k)}
              >
                <span className="dot" style={{ background: catColor(k) }} />
                {CATS[k].label}
              </button>
            ))}
          </div>
        </div>

        {styleList.length > 0 && (
          <div className="field">
            <span className="flabel" id="lbl-style">種類</span>
            <div className="chips" role="group" aria-labelledby="lbl-style">
              {styleList.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="chip opt"
                  aria-pressed={style === s.key}
                  onClick={() => setStyle(style === s.key ? "" : s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="rf-name">名前</label>
          <input id="rf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="section-rule">素性</div>
        <div className="origin">
          {originFields.map((f) =>
            f.type === "choice" ? (
              <div className="field wide" key={f.k}>
                <span className="flabel" id={`lbl-${f.k}`}>{f.label}</span>
                <div className="chips" role="group" aria-labelledby={`lbl-${f.k}`}>
                  {f.options!.map((o) => {
                    const bean = f.beans ? beanColor(o) : null;
                    return (
                      <button
                        key={o}
                        type="button"
                        className="chip opt"
                        aria-pressed={origin[f.k] === o}
                        onClick={() =>
                          setOrigin((prev) => {
                            const out = { ...prev };
                            if (out[f.k] === o) delete out[f.k];
                            else out[f.k] = o;
                            return out;
                          })
                        }
                      >
                        {bean && <span className="bean" style={{ background: bean }} />}
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={f.wide ? "field wide" : "field"} key={f.k}>
                <label htmlFor={`rf-${f.k}`}>{f.label}</label>
                {f.type === "num" ? (
                  <div className="unit-input">
                    <input
                      id={`rf-${f.k}`}
                      type="number"
                      min={0}
                      max={96}
                      step={0.5}
                      value={origin[f.k] ?? ""}
                      onChange={(e) => setOrigin({ ...origin, [f.k]: e.target.value })}
                    />
                    <span className="unit">{f.unit}</span>
                  </div>
                ) : (
                  <input
                    id={`rf-${f.k}`}
                    type="text"
                    value={origin[f.k] ?? ""}
                    onChange={(e) => setOrigin({ ...origin, [f.k]: e.target.value })}
                  />
                )}
              </div>
            ),
          )}
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="rf-when">日時</label>
            <input id="rf-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="field">
            <span className="flabel">好み</span>
            <Stars value={rating} onChange={setRating} />
          </div>
        </div>

        <div className="section-rule">味と香り</div>

        <div className="field" role="group" aria-labelledby="lbl-flavour">
          <span className="flabel" id="lbl-flavour">フレーバーノート</span>
          {notes.length > 0 && (
            <div className="notepicked">
              {notes.map((n) => (
                <span className="ntag" key={n}>
                  <b>{n}</b>
                  <button type="button" aria-label={`${n}を外す`} onClick={() => toggleNote(n)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="notebox">
            {mine.length > 0 && (
              <div className="ngroup">
                <div className="gname">
                  <em>自分の言葉</em>
                </div>
                <div className="chips">
                  {mine.map((n) => (
                    <span className="chips" style={{ gap: 0 }} key={n}>
                      <button
                        type="button"
                        className="nchip mine"
                        aria-pressed={notes.includes(n)}
                        onClick={() => toggleNote(n)}
                      >
                        {n}
                      </button>
                      <button
                        type="button"
                        className="vdel"
                        title="一覧から消す"
                        aria-label={`${n}を一覧から消す`}
                        onClick={() => dropVocab(n)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {flavorsOf(cat).map((grp) => (
              <div className="ngroup" key={grp.g}>
                <div className="gname">{grp.g}</div>
                <div className="chips">
                  {grp.items.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="nchip"
                      aria-pressed={notes.includes(n)}
                      onClick={() => toggleNote(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="noteadd">
            <input
              type="text"
              value={noteDraft}
              placeholder="言葉を足す（この系統に残ります）"
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitNote();
                }
              }}
            />
            <button type="button" onClick={commitNote}>
              追加
            </button>
          </div>
        </div>

        <div className="field" role="group" aria-labelledby="lbl-axes">
          <span className="flabel" id="lbl-axes">
            {cat === "coffee" ? "SCAJ カッピングフォーム" : "評価軸"}
          </span>
          <Axes spec={spec} values={axes} onChange={toggleAxis} />
          <div className="axis-foot">
            {spec.scaj ? (
              total == null ? (
                <>
                  <span>
                    基礎点 36 に8項目を足して100点満点。あと <b className="num">{spec.items.length - doneAxes}</b> 項目
                  </span>
                  <button
                    type="button"
                    className="linkbtn"
                    onClick={() => {
                      const next = { ...axes };
                      for (const it of AXES.coffee.items) if (!next[it.k]) next[it.k] = 6;
                      setAxes(next);
                    }}
                  >
                    基準の6点から始める
                  </button>
                </>
              ) : (
                <>
                  <span>
                    合計 <span className="total">{total}</span> / 100
                  </span>
                  <span className={total >= SPECIALTY ? "verdict" : "verdict no"}>
                    {total >= SPECIALTY
                      ? "スペシャルティの目安 80点以上"
                      : `80点まであと ${SPECIALTY - total}点`}
                  </span>
                  <button type="button" className="linkbtn" onClick={() => setAxes({})}>
                    採点を消す
                  </button>
                </>
              )
            ) : doneAxes === 0 ? (
              <span>気になった軸だけ押せば大丈夫です</span>
            ) : (
              <>
                <span>
                  <b className="num">{doneAxes}</b> / {spec.items.length} 項目を評価
                </span>
                <button type="button" className="linkbtn" onClick={() => setAxes({})}>
                  評価を消す
                </button>
              </>
            )}
          </div>
        </div>

        {!isFood(cat) && !editing && (
          <div>
            <div className="section-rule">ペアリング</div>
            <label className="pairtoggle">
              <input
                type="checkbox"
                checked={withPairing}
                onChange={(e) => {
                  setWithPairing(e.target.checked);
                  if (e.target.checked && pairings.length === 0)
                    setPairings([{ name: "", sub: "", rating: 0, axes: {}, memo: "" }]);
                }}
              />
              ペアリングも一緒に記録する
            </label>
            {withPairing && (
              <>
                <div className="foodlist">
                  {pairings.map((p, i) => (
                    <div className="pairblock" key={i} style={{ ["--cat" as string]: "var(--food)" }}>
                      <div className="pairblock-head">
                        <span className="eyebrow">ペアリング {i + 1}</span>
                        {pairings.length > 1 && (
                          <button
                            type="button"
                            className="linkbtn"
                            onClick={() => setPairings(pairings.filter((_, idx) => idx !== i))}
                          >
                            消す
                          </button>
                        )}
                      </div>
                      <div className="field">
                        <label htmlFor={`pair-${i}-name`}>名前</label>
                        <input
                          id={`pair-${i}-name`}
                          type="text"
                          value={p.name}
                          onChange={(e) => patchPairing(i, { name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`pair-${i}-sub`}>補助情報</label>
                        <input
                          id={`pair-${i}-sub`}
                          type="text"
                          value={p.sub}
                          onChange={(e) => patchPairing(i, { sub: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <span className="flabel">好み</span>
                        <Stars mini value={p.rating} onChange={(n) => patchPairing(i, { rating: n })} />
                      </div>
                      <Axes
                        spec={AXES.food}
                        values={p.axes}
                        onChange={(k, v) => {
                          const next = { ...p.axes };
                          if (next[k] === v) delete next[k];
                          else next[k] = v;
                          patchPairing(i, { axes: next });
                        }}
                      />
                      <div className="field">
                        <label htmlFor={`pair-${i}-memo`}>メモ</label>
                        <input
                          id={`pair-${i}-memo`}
                          type="text"
                          value={p.memo}
                          onChange={(e) => patchPairing(i, { memo: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="addfood"
                  onClick={() => setPairings([...pairings, { name: "", sub: "", rating: 0, axes: {}, memo: "" }])}
                >
                  ペアリングを追加
                </button>
              </>
            )}
          </div>
        )}

        <div className="field">
          <label htmlFor="rf-memo">メモ</label>
          <textarea id="rf-memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>

        <button type="button" className="submit" onClick={submit} disabled={pending}>
          {pending ? "保存中…" : editing ? "更新する" : "書き留める"}
        </button>
        {editing && (
          <p className="hint">
            ペアリングの組み替えは編集ではできません。組み直したい場合は記録し直してください。
          </p>
        )}
      </div>
    </div>
  );
}
