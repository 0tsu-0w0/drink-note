import type { Category } from "@/lib/domain";

/** DB の1行（snake_case のまま扱う） */
export type DrinkRecord = {
  id: string;
  user_id: string;
  pair_id: string | null;
  created_at: string;
  updated_at: string;
  recorded_at: string;
  category: Category;
  style: string | null;
  name: string;
  origin: Record<string, string>;
  rating: number | null;
  axes: Record<string, number>;
  notes: string[];
  memo: string | null;
};

/** フォームから受け取るペアリング1件 */
export type PairingInput = {
  name: string;
  sub: string;
  rating: number;
  axes: Record<string, number>;
  memo: string;
};

export type ActionResult = { ok: true } | { ok: false; message: string };
