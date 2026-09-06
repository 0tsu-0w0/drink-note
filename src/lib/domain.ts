/**
 * Sip Notes のドメイン定義。
 * カテゴリ・種類・評価軸・素性・フレーバー語彙の正本はすべてこのファイル。
 */

/* ================= 系統とカテゴリ ================= */
export const FAMILIES = {
  coffee: { label: "コーヒー", color: "var(--coffee)" },
  tea: { label: "紅茶", color: "var(--tea)" },
  green: { label: "日本茶", color: "var(--green)" },
  liquor: { label: "お酒", color: "var(--alcohol)" },
  food: { label: "ペアリング", color: "var(--food)" },
  other: { label: "その他", color: "var(--other)" },
} as const;

export type Family = keyof typeof FAMILIES;
export const FAM_KEYS = Object.keys(FAMILIES) as Family[];

export const CATS = {
  coffee: { label: "コーヒー", fam: "coffee" },
  tea: { label: "紅茶", fam: "tea" },
  green: { label: "日本茶", fam: "green" },
  sake: { label: "日本酒", fam: "liquor" },
  beer: { label: "ビール", fam: "liquor" },
  wine: { label: "ワイン", fam: "liquor" },
  sour: { label: "サワー", fam: "liquor" },
  shochu: { label: "焼酎", fam: "liquor" },
  whiskey: { label: "ウイスキー", fam: "liquor" },
  liqueur: { label: "リキュール", fam: "liquor" },
  cocktail: { label: "カクテル", fam: "liquor" },
  food: { label: "ペアリング", fam: "food" },
  other: { label: "その他", fam: "other" },
} as const satisfies Record<string, { label: string; fam: Family }>;

export type Category = keyof typeof CATS;
export const CAT_KEYS = Object.keys(CATS) as Category[];

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && v in CATS;
}
export function catOf(k: string) {
  return isCategory(k) ? CATS[k] : CATS.other;
}
export function famOf(k: string): Family {
  return catOf(k).fam;
}
export function catColor(k: string) {
  return FAMILIES[famOf(k)].color;
}
export function isFood(k: string) {
  return k === "food";
}

/* ================= 種類（style） ================= */
export type StyleOption = { key: string; label: string };

export const STYLES: Partial<Record<Category, StyleOption[]>> = {
  coffee: [
    { key: "drip", label: "ドリップ" },
    { key: "espresso", label: "エスプレッソ" },
    { key: "latte", label: "カフェラテ" },
    { key: "press", label: "フレンチプレス" },
    { key: "cold", label: "水出し" },
    { key: "other", label: "その他" },
  ],
  tea: [
    { key: "straight", label: "ストレート" },
    { key: "milk", label: "ミルク" },
    { key: "lemon", label: "レモン" },
    { key: "iced", label: "アイス" },
    { key: "chai", label: "チャイ" },
    { key: "other", label: "その他" },
  ],
  green: [
    { key: "sencha", label: "煎茶" },
    { key: "gyokuro", label: "玉露" },
    { key: "hojicha", label: "ほうじ茶" },
    { key: "matcha", label: "抹茶" },
    { key: "bancha", label: "番茶" },
    { key: "genmaicha", label: "玄米茶" },
    { key: "mugicha", label: "麦茶" },
    { key: "other", label: "その他" },
  ],
  sake: [
    { key: "junmai", label: "純米" },
    { key: "ginjo", label: "吟醸" },
    { key: "daiginjo", label: "大吟醸" },
    { key: "honjozo", label: "本醸造" },
    { key: "namazake", label: "生酒" },
    { key: "other", label: "その他" },
  ],
  beer: [
    { key: "lager", label: "ラガー" },
    { key: "ale", label: "エール" },
    { key: "ipa", label: "IPA" },
    { key: "weizen", label: "ウィート" },
    { key: "stout", label: "スタウト" },
    { key: "other", label: "その他" },
  ],
  wine: [
    { key: "red", label: "赤" },
    { key: "white", label: "白" },
    { key: "rose", label: "ロゼ" },
    { key: "sparkling", label: "スパークリング" },
    { key: "other", label: "その他" },
  ],
  sour: [
    { key: "lemon", label: "レモン" },
    { key: "grapefruit", label: "グレフル" },
    { key: "calpis", label: "カルピス系" },
    { key: "other", label: "その他" },
  ],
  shochu: [
    { key: "imo", label: "芋" },
    { key: "mugi", label: "麦" },
    { key: "kome", label: "米" },
    { key: "other", label: "その他" },
  ],
  whiskey: [
    { key: "scotch", label: "スコッチ" },
    { key: "bourbon", label: "バーボン" },
    { key: "irish", label: "アイリッシュ" },
    { key: "japanese", label: "ジャパニーズ" },
    { key: "other", label: "その他" },
  ],
  liqueur: [
    { key: "fruit", label: "果実系" },
    { key: "herb", label: "ハーブ系" },
    { key: "cream", label: "クリーム系" },
    { key: "other", label: "その他" },
  ],
  cocktail: [
    { key: "short", label: "ショート" },
    { key: "long", label: "ロング" },
    { key: "highball", label: "ハイボール系" },
    { key: "other", label: "その他" },
  ],
};

export function stylesOf(cat: string): StyleOption[] {
  return (isCategory(cat) && STYLES[cat]) || [];
}
export function styleLabel(cat: string, key: string | null | undefined): string {
  if (!key) return "";
  return stylesOf(cat).find((s) => s.key === key)?.label ?? "";
}
export function isValidStyle(cat: string, key: string | null | undefined) {
  if (!key) return true;
  return stylesOf(cat).some((s) => s.key === key);
}

/* ================= 評価軸 ================= */
export const SCAJ_BASE = 36;
export const SPECIALTY = 80;

export type AxisItem = { k: string; label: string; poles?: [string, string] };
export type AxisSpec = { max: number; scaj?: boolean; items: AxisItem[] };

const SWEETDRY: [string, string] = ["辛口", "甘口"];
const LIQUID_COLOUR: [string, string] = ["淡い", "濃い"];

export const AXES: Record<Category, AxisSpec> = {
  coffee: {
    max: 8,
    scaj: true,
    items: [
      { k: "clean", label: "カップのきれいさ" },
      { k: "sweetness", label: "甘さ" },
      { k: "acidity", label: "酸の質" },
      { k: "mouthfeel", label: "口に含んだ質感" },
      { k: "flavor", label: "風味" },
      { k: "aftertaste", label: "後味の印象度" },
      { k: "balance", label: "バランス" },
      { k: "overall", label: "総合評価" },
    ],
  },
  tea: {
    max: 5,
    items: [
      { k: "aroma", label: "香り" },
      { k: "body", label: "コク" },
      { k: "astring", label: "渋み" },
      { k: "finish", label: "余韻" },
      { k: "colour", label: "水色", poles: LIQUID_COLOUR },
    ],
  },
  green: {
    max: 5,
    items: [
      { k: "aroma", label: "香り" },
      { k: "umami", label: "旨み" },
      { k: "astring", label: "渋み" },
      { k: "finish", label: "余韻" },
      { k: "colour", label: "水色", poles: LIQUID_COLOUR },
    ],
  },
  sake: {
    max: 5,
    items: [
      { k: "sweetness", label: "甘み" },
      { k: "acidity", label: "酸味" },
      { k: "aroma", label: "香り" },
    ],
  },
  beer: {
    max: 5,
    items: [
      { k: "bitterness", label: "苦味" },
      { k: "body", label: "コク" },
      { k: "aroma", label: "香り" },
    ],
  },
  wine: {
    max: 5,
    items: [
      { k: "body", label: "ボディ" },
      { k: "acidity", label: "酸味" },
      { k: "aroma", label: "香り" },
    ],
  },
  sour: {
    max: 5,
    items: [
      { k: "acidity", label: "酸味" },
      { k: "sweetness", label: "甘さ" },
    ],
  },
  shochu: {
    max: 5,
    items: [
      { k: "aroma", label: "香り" },
      { k: "umami", label: "旨み" },
      { k: "finish", label: "キレ" },
    ],
  },
  whiskey: {
    max: 5,
    items: [
      { k: "aroma", label: "香り" },
      { k: "smoky", label: "スモーキー" },
      { k: "finish", label: "キレ" },
    ],
  },
  liqueur: {
    max: 5,
    items: [
      { k: "sweetness", label: "甘さ" },
      { k: "acidity", label: "酸味" },
      { k: "fruitiness", label: "果実感" },
    ],
  },
  cocktail: {
    max: 5,
    items: [
      { k: "sweetness", label: "甘さ" },
      { k: "acidity", label: "酸味" },
      { k: "balance", label: "バランス" },
    ],
  },
  food: {
    max: 5,
    items: [
      { k: "saltiness", label: "塩味" },
      { k: "sweetness", label: "甘み" },
      { k: "umami", label: "旨み" },
      { k: "spiciness", label: "辛み" },
    ],
  },
  other: {
    max: 5,
    items: [
      { k: "aroma", label: "香り" },
      { k: "body", label: "コク" },
      { k: "finish", label: "キレ" },
    ],
  },
};

/** 種類によって評価軸そのものが入れ替わるもの */
export const AXES_BY_STYLE: Partial<Record<Category, Record<string, AxisItem[]>>> = {
  wine: {
    red: [
      { k: "body", label: "ボディ" },
      { k: "tannin", label: "渋み" },
      { k: "acidity", label: "酸味" },
    ],
    white: [
      { k: "acidity", label: "酸味" },
      { k: "aroma", label: "香り" },
      { k: "sweetness", label: "甘口度", poles: SWEETDRY },
    ],
    rose: [
      { k: "body", label: "ボディ" },
      { k: "acidity", label: "酸味" },
      { k: "aroma", label: "香り" },
    ],
    sparkling: [
      { k: "acidity", label: "酸味" },
      { k: "sweetness", label: "甘口度", poles: SWEETDRY },
      { k: "aroma", label: "香り" },
    ],
  },
  whiskey: {
    bourbon: [
      { k: "aroma", label: "香り" },
      { k: "sweetness", label: "甘み" },
      { k: "finish", label: "キレ" },
    ],
    irish: [
      { k: "aroma", label: "香り" },
      { k: "body", label: "ボディ" },
      { k: "finish", label: "キレ" },
    ],
    japanese: [
      { k: "aroma", label: "香り" },
      { k: "body", label: "ボディ" },
      { k: "finish", label: "キレ" },
    ],
  },
};

export function axesFor(cat: string, style?: string | null): AxisSpec {
  const key: Category = isCategory(cat) ? cat : "other";
  const base = AXES[key];
  const over = style ? AXES_BY_STYLE[key]?.[style] : undefined;
  return over ? { max: base.max, scaj: base.scaj, items: over } : base;
}

/** 過去データや別の種類で付けた軸を表示するための予備ラベル */
export const AXIS_LABELS: Record<string, string> = {
  aroma: "香り", sweetness: "甘さ", acidity: "酸味", body: "コク", astring: "渋み",
  finish: "余韻", colour: "水色", umami: "旨み", bitter: "苦味・渋み", bitterness: "苦味",
  clean: "カップのきれいさ", mouthfeel: "口に含んだ質感", flavor: "風味",
  aftertaste: "後味の印象度", balance: "バランス", overall: "総合評価",
  tannin: "渋み", smoky: "スモーキー", saltiness: "塩味", spiciness: "辛み",
  fruitiness: "果実感",
};

const POLE_WORDS = ["", "とても", "やや", "中庸", "やや", "とても"];

export function axisText(item: AxisItem | null, v: number, max: number): string {
  if (item?.poles) {
    if (v === 3) return "中庸";
    return (POLE_WORDS[v] ?? "") + (v < 3 ? item.poles[0] : item.poles[1]);
  }
  return `${v}/${max}`;
}

export function scajTotal(cat: string, axes: Record<string, number>): number | null {
  if (cat !== "coffee") return null;
  let sum = 0;
  for (const it of AXES.coffee.items) {
    const v = axes[it.k];
    if (!v) return null;
    sum += v;
  }
  return SCAJ_BASE + sum;
}

/* ================= 素性 ================= */
export const ROASTS = [
  { v: "ライト", c: "#C79A6B" },
  { v: "シナモン", c: "#B5814E" },
  { v: "ミディアム", c: "#9C6636" },
  { v: "ハイ", c: "#85512A" },
  { v: "シティ", c: "#6E4022" },
  { v: "フルシティ", c: "#57301A" },
  { v: "フレンチ", c: "#3E2113" },
  { v: "イタリアン", c: "#2A1610" },
];

export function beanColor(v: string): string | null {
  return ROASTS.find((r) => r.v === v)?.c ?? null;
}

export type OriginField = {
  k: string;
  label: string;
  /** 薄く表示する記入例。何を書く欄なのかを示すためのもので、初期値ではない。 */
  ph?: string;
  wide?: boolean;
  type?: "text" | "num" | "choice";
  unit?: string;
  options?: string[];
  beans?: boolean;
};

const LIQUOR_ORIGIN: OriginField[] = [
  { k: "origin", label: "産地", ph: "ブルゴーニュ、新潟", wide: true },
  { k: "maker", label: "蔵元・メーカー", ph: "蔵元・醸造所・ドメーヌ", wide: true },
  { k: "variety", label: "原料・品種", ph: "山田錦、ピノ・ノワール" },
  { k: "vintage", label: "年", ph: "2021 / R5BY" },
  { k: "abv", label: "度数", type: "num", unit: "%", ph: "15" },
];

const ORIGIN_BASE: Record<Category, OriginField[]> = {
  coffee: [
    { k: "origin", label: "産地", ph: "エチオピア イルガチェフェ", wide: true },
    { k: "farm", label: "農園", ph: "コンガ ウォッシングステーション", wide: true },
    { k: "maker", label: "焙煎者", ph: "焙煎した店・人" },
    { k: "variety", label: "品種", ph: "ゲイシャ、在来種" },
    { k: "grade", label: "焙煎度", type: "choice", options: ROASTS.map((r) => r.v), beans: true },
  ],
  tea: [
    { k: "origin", label: "産地", ph: "インド ダージリン", wide: true },
    { k: "farm", label: "茶園", ph: "キャッスルトン", wide: true },
    { k: "maker", label: "ブランド・製茶者", ph: "店名・ブランド" },
    { k: "variety", label: "品種", ph: "中国種、アッサム種" },
    {
      k: "grade",
      label: "摘み・グレード",
      type: "choice",
      options: ["ファーストフラッシュ", "セカンドフラッシュ", "オータムナル", "OP", "BOP", "CTC"],
    },
  ],
  green: [
    { k: "origin", label: "産地", ph: "福岡 八女、京都 宇治", wide: true },
    { k: "farm", label: "茶園", ph: "茶園名", wide: true },
    { k: "maker", label: "茶舗", ph: "店名" },
    { k: "variety", label: "品種", ph: "やぶきた、さえみどり" },
    { k: "grade", label: "火入れ", type: "choice", options: ["弱火入れ", "中火入れ", "強火入れ"] },
  ],
  sake: LIQUOR_ORIGIN,
  beer: LIQUOR_ORIGIN,
  wine: LIQUOR_ORIGIN,
  sour: LIQUOR_ORIGIN,
  shochu: LIQUOR_ORIGIN,
  whiskey: LIQUOR_ORIGIN,
  liqueur: LIQUOR_ORIGIN,
  cocktail: LIQUOR_ORIGIN,
  food: [{ k: "maker", label: "店・作り手", ph: "店名、自分で作った など", wide: true }],
  other: [
    { k: "origin", label: "産地", ph: "産地・地域", wide: true },
    { k: "maker", label: "造り手・ブランド", ph: "メーカー名", wide: true },
  ],
};

/** 補助情報に何を書くかはカテゴリで違うので、例も変える */
const SUB_INFO_PH: Partial<Record<Category, string>> = {
  coffee: "精製方法、標高、焙煎日 など",
  tea: "摘採期、等級 など",
  green: "火入れの具合、収穫期 など",
  sake: "精米歩合、酵母 など",
  beer: "ホップ品種、IBU など",
  wine: "畑、樽熟成の有無 など",
  sour: "ベース酒、割り方 など",
  shochu: "蒸留方法、熟成年数 など",
  whiskey: "蒸留所、熟成年数、樽 など",
  liqueur: "ベース酒、風味 など",
  cocktail: "ベース酒、作り方 など",
  food: "料理のジャンル、材料 など",
};

/** すべてのカテゴリに共通で付く欄 */
function commonOrigin(cat: Category): OriginField[] {
  return [
    { k: "subInfo", label: "補助情報", ph: SUB_INFO_PH[cat] ?? "書き添えておきたいこと", wide: true },
    { k: "place", label: "場所", ph: "自宅、店名", wide: true },
  ];
}

export function originOf(cat: string): OriginField[] {
  const key: Category = isCategory(cat) ? cat : "other";
  return [...ORIGIN_BASE[key], ...commonOrigin(key)];
}

/** 名前の欄に薄く出す記入例 */
const NAME_PH: Record<Category, string> = {
  coffee: "イルガチェフェ コンガ",
  tea: "ダージリン セカンドフラッシュ",
  green: "八女の煎茶",
  sake: "純米吟醸 ○○",
  beer: "ペールエール",
  wine: "シャブリ",
  sour: "レモンサワー",
  shochu: "芋焼酎 ○○",
  whiskey: "バッファロートレース",
  liqueur: "梅酒",
  cocktail: "ジントニック",
  food: "スコーン、枝豆",
  other: "飲んだものの名前",
};

export function namePlaceholder(cat: string): string {
  return NAME_PH[isCategory(cat) ? cat : "other"];
}

/* ================= フレーバーの語彙 ================= */
export type FlavorGroup = { g: string; items: string[] };

export const FLAVORS: Record<Family, FlavorGroup[]> = {
  coffee: [
    { g: "フルーティ", items: ["ベリー", "ブルーベリー", "ストロベリー", "柑橘", "レモン", "オレンジ", "りんご", "桃", "ぶどう", "トロピカル", "レーズン", "プルーン"] },
    { g: "フローラル", items: ["花", "ジャスミン", "ローズ", "カモミール", "紅茶のよう"] },
    { g: "甘い", items: ["黒糖", "キャラメル", "蜂蜜", "バニラ", "メープル"] },
    { g: "ナッツ・ココア", items: ["アーモンド", "ヘーゼルナッツ", "ピーナッツ", "チョコレート", "ダークチョコ", "ココア"] },
    { g: "スパイス", items: ["シナモン", "クローブ", "ナツメグ", "胡椒"] },
    { g: "ロースト", items: ["焙煎香", "香ばしい", "スモーキー", "焦げ", "タバコ"] },
    { g: "青み・植物", items: ["青草", "ハーブ", "豆っぽい", "未熟"] },
    { g: "発酵・その他", items: ["ワイニー", "発酵", "土っぽい", "紙っぽい", "カビ臭"] },
  ],
  tea: [
    { g: "香り", items: ["花香", "果香", "蜜香", "マスカット", "モルティ", "スモーキー", "スパイシー", "ウッディ", "干し草"] },
    { g: "味わい", items: ["ブリスク（爽快）", "コク", "渋み", "まろやか", "甘い余韻", "青葉", "ミルクに合う"] },
  ],
  green: [
    { g: "香り", items: ["覆い香", "若芽", "青葉", "火香", "香ばしい", "海苔のよう", "花のよう"] },
    { g: "味わい", items: ["旨み", "甘み", "渋み", "苦味", "まろやか", "キレ", "青い"] },
  ],
  liquor: [
    { g: "果実", items: ["柑橘", "りんご", "洋梨", "メロン", "バナナ", "ベリー", "黒果実", "トロピカル"] },
    { g: "花・穀物", items: ["花", "米の旨み", "麦芽", "カラメル", "蜂蜜", "ハーブ"] },
    { g: "樽・熟成", items: ["樽", "バニラ", "スモーキー", "ナッツ", "熟成香", "木香"] },
    { g: "味わい", items: ["辛口", "甘口", "キレ", "まろやか", "苦味", "渋み", "ミネラル", "ホップ"] },
    { g: "欠点", items: ["老ね香", "酸化", "コルク臭"] },
  ],
  food: [
    { g: "味", items: ["塩気", "旨み", "甘い", "酸味", "苦味", "辛い", "だし"] },
    { g: "香り・食感", items: ["香ばしい", "燻製", "発酵", "脂の甘み", "にんにく", "さっぱり", "こってり", "歯ごたえ", "ほろほろ"] },
    { g: "甘いもの", items: ["チョコレート", "バター", "クリーム", "焼き菓子", "餡", "果実", "メープル", "スパイス"] },
  ],
  other: [
    { g: "味わい", items: ["甘い", "酸っぱい", "苦い", "さっぱり", "濃厚", "炭酸感", "フルーティ", "こっくり"] },
  ],
};

export function flavorsOf(cat: string): FlavorGroup[] {
  return FLAVORS[famOf(cat)];
}

export type Vocab = Partial<Record<Family, string[]>>;

export function isKnownNote(cat: string, note: string, vocab: Vocab): boolean {
  const fam = famOf(cat);
  if ((vocab[fam] ?? []).includes(note)) return true;
  return flavorsOf(cat).some((g) => g.items.includes(note));
}

/* ================= 表示のための小道具 ================= */
export const WD = ["日", "月", "火", "水", "木", "金", "土"];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
