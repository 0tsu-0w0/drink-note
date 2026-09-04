"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, PairingInput } from "@/lib/types";
import {
  AXES,
  FAM_KEYS,
  isCategory,
  isFood,
  isValidStyle,
  originOf,
  type Family,
  type Vocab,
} from "@/lib/domain";

/* ================= 認証 ================= */

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Supabase の英語エラーを日本語にして、何をすればいいかまで伝える */
function authMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "メールアドレスかパスワードが違います。";
  if (m.includes("email not confirmed")) return "メールの確認がまだ済んでいません。届いた確認メールのリンクを開いてください。";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "このメールアドレスは登録済みです。ログインしてください。";
  if (m.includes("password should be at least")) return "パスワードは6文字以上にしてください。";
  if (m.includes("rate limit") || m.includes("too many"))
    return "試行が続いたため一時的に制限されています。しばらく待ってからやり直してください。";
  if (m.includes("unable to validate email") || m.includes("invalid format"))
    return "メールアドレスの形式が正しくありません。";
  return "うまくいきませんでした：" + raw;
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "メールアドレスとパスワードを入れてください。" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: authMessage(error.message) };

  const next = String(formData.get("next") ?? "/records");
  redirect(next.startsWith("/") ? next : "/records");
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "メールアドレスとパスワードを入れてください。" };
  if (password.length < 8) return { ok: false, message: "パスワードは8文字以上にしてください。" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error) return { ok: false, message: authMessage(error.message) };

  /* メール確認が必要な設定のときはセッションが返らない */
  if (!data.session) {
    return { ok: false, message: `${email} に確認メールを送りました。メール内のリンクを開くと登録が完了します。` };
  }
  redirect("/records");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** 再設定メールを送る。宛先が登録済みかどうかは答えを変えず、外から探れないようにする。 */
export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "メールアドレスを入れてください。" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset/new`,
  });

  /* 実際の結果に関わらず同じ文面を返す。ただし送信制限だけは伝える。 */
  if (error && /rate limit|too many/i.test(error.message)) {
    return { ok: false, message: "送信が続いたため一時的に制限されています。しばらく待ってからやり直してください。" };
  }
  return {
    ok: false,
    message: `${email} が登録済みであれば、再設定用のリンクを送りました。メールを確認してください。`,
  };
}

/** 再設定リンクから戻ってきた状態、またはログイン中にパスワードを変える */
export async function updatePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { ok: false, message: "パスワードは8文字以上にしてください。" };
  if (password !== confirm) return { ok: false, message: "2つのパスワードが一致していません。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      message: "リンクの有効期限が切れています。もう一度メールを送るところからやり直してください。",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: authMessage(error.message) };

  redirect("/records");
}

/* ================= 記録 ================= */

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** フォームから来た評価軸を、そのカテゴリで許される範囲だけ残して数値化する */
function parseAxes(raw: unknown, max: number): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (Number.isInteger(n) && n >= 1 && n <= max) out[k] = n;
  }
  return out;
}

function parseOrigin(raw: unknown, category: string): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const allowed = new Set(originOf(category).map((f) => f.k));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowed.has(k)) continue;
    const s = String(v ?? "").trim().slice(0, 200);
    if (s) out[k] = s;
  }
  return out;
}

function parseNotes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    const s = String(v ?? "").trim().slice(0, 60);
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
    if (out.length >= 40) break;
  }
  return out;
}

function parseRating(raw: unknown): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

export type RecordInput = {
  id?: string;
  category: string;
  style: string;
  name: string;
  recordedAt: string;
  origin: Record<string, string>;
  rating: number;
  axes: Record<string, number>;
  notes: string[];
  memo: string;
  pairings: PairingInput[];
};

export async function createRecord(input: RecordInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  if (!isCategory(input.category)) return { ok: false, message: "カテゴリが正しくありません。" };
  const name = String(input.name ?? "").trim();
  if (!name) return { ok: false, message: "名前を入れてください。" };
  const style = isValidStyle(input.category, input.style) ? input.style || null : null;

  const when = new Date(input.recordedAt);
  const recordedAt = (Number.isNaN(when.getTime()) ? new Date() : when).toISOString();

  const pairings = isFood(input.category)
    ? []
    : (input.pairings ?? []).filter((p) => String(p?.name ?? "").trim()).slice(0, 10);
  const pairId = pairings.length ? crypto.randomUUID() : null;
  const place = input.origin?.place ?? "";

  const rows = [
    {
      user_id: user.id,
      pair_id: pairId,
      recorded_at: recordedAt,
      category: input.category,
      style,
      name: name.slice(0, 200),
      origin: parseOrigin(input.origin, input.category),
      rating: parseRating(input.rating),
      axes: parseAxes(input.axes, AXES[input.category].max),
      notes: parseNotes(input.notes),
      memo: String(input.memo ?? "").trim().slice(0, 2000) || null,
    },
    ...pairings.map((p, i) => {
      const origin: Record<string, string> = {};
      const sub = String(p.sub ?? "").trim();
      if (sub) origin.subInfo = sub.slice(0, 200);
      /* 同じフォームで保存する記録には同じ場所が入る */
      if (place) origin.place = place;
      return {
        user_id: user.id,
        pair_id: pairId,
        recorded_at: new Date(new Date(recordedAt).getTime() + (i + 1) * 1000).toISOString(),
        category: "food" as const,
        style: null,
        name: String(p.name).trim().slice(0, 200),
        origin,
        rating: parseRating(p.rating),
        axes: parseAxes(p.axes, AXES.food.max),
        notes: [],
        memo: String(p.memo ?? "").trim().slice(0, 2000) || null,
      };
    }),
  ];

  const { error } = await supabase.from("records").insert(rows);
  if (error) return { ok: false, message: "保存できませんでした：" + error.message };

  revalidatePath("/records");
  return { ok: true };
}

export async function updateRecord(input: RecordInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!input.id) return { ok: false, message: "更新する記録が指定されていません。" };
  if (!isCategory(input.category)) return { ok: false, message: "カテゴリが正しくありません。" };
  const name = String(input.name ?? "").trim();
  if (!name) return { ok: false, message: "名前を入れてください。" };

  const when = new Date(input.recordedAt);
  const { error } = await supabase
    .from("records")
    .update({
      category: input.category,
      style: isValidStyle(input.category, input.style) ? input.style || null : null,
      name: name.slice(0, 200),
      recorded_at: (Number.isNaN(when.getTime()) ? new Date() : when).toISOString(),
      origin: parseOrigin(input.origin, input.category),
      rating: parseRating(input.rating),
      axes: parseAxes(input.axes, AXES[input.category].max),
      notes: parseNotes(input.notes),
      memo: String(input.memo ?? "").trim().slice(0, 2000) || null,
    })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: "更新できませんでした：" + error.message };

  revalidatePath("/records");
  return { ok: true };
}

export async function deleteRecord(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: target } = await supabase
    .from("records")
    .select("pair_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("records").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, message: "削除できませんでした：" + error.message };

  /* ペアに1件しか残らなくなったら、その記録のペアも解く */
  if (target?.pair_id) {
    const { data: rest } = await supabase
      .from("records")
      .select("id")
      .eq("user_id", user.id)
      .eq("pair_id", target.pair_id);
    if (rest && rest.length === 1) {
      await supabase.from("records").update({ pair_id: null }).eq("id", rest[0].id).eq("user_id", user.id);
    }
  }

  revalidatePath("/records");
  return { ok: true };
}

/* ================= フレーバー語彙 ================= */

export async function saveVocab(vocab: Vocab): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const clean: Vocab = {};
  for (const fam of FAM_KEYS) {
    const list = vocab[fam];
    if (!Array.isArray(list)) continue;
    const seen = new Set<string>();
    clean[fam] = list
      .map((w) => String(w ?? "").trim().slice(0, 60))
      .filter((w) => w && !seen.has(w) && (seen.add(w), true))
      .slice(0, 300);
  }

  const { error } = await supabase
    .from("flavor_vocab")
    .upsert({ user_id: user.id, words: clean as Record<Family, string[]> }, { onConflict: "user_id" });

  if (error) return { ok: false, message: "語彙を保存できませんでした：" + error.message };
  revalidatePath("/records");
  return { ok: true };
}
