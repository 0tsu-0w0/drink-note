-- Sip Notes — 初期スキーマ
-- Supabase の SQL Editor に貼り付けて実行するか、supabase db push で適用します。

-- ============================================================
-- records: 一杯（およびペアリング）1件ぶんの記録
-- ============================================================
create table if not exists public.records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  -- 飲みものとペアリングを結ぶ共通 ID。単体の記録では null。
  pair_id       uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- ユーザーが選んだ日時（記録した時刻ではなく、飲んだ時刻）
  recorded_at   timestamptz not null,
  category      text not null check (category in (
                  'coffee','tea','green','sake','beer','wine','sour','shochu',
                  'whiskey','liqueur','cocktail','food','other')),
  -- カテゴリ内の種類。ワインの red、ウイスキーの bourbon など。任意。
  style         text,
  name          text not null check (char_length(name) between 1 and 200),
  -- 産地・農園・焙煎者・焙煎度・補助情報・場所などをカテゴリ別に格納
  origin        jsonb not null default '{}'::jsonb,
  rating        smallint check (rating is null or rating between 1 and 5),
  -- 評価軸を KV で格納。コーヒーは SCAJ の8項目（各1〜8）、他は1〜5。
  axes          jsonb not null default '{}'::jsonb,
  notes         text[] not null default '{}',
  memo          text
);

comment on table  public.records          is '一杯ごとのテイスティング記録';
comment on column public.records.pair_id  is '飲みものとペアリングを結ぶ共通 ID';
comment on column public.records.axes     is 'カテゴリ・種類ごとの評価軸を KV で保持する';

create index if not exists records_user_recorded_idx
  on public.records (user_id, recorded_at desc, created_at desc);
create index if not exists records_pair_idx
  on public.records (pair_id) where pair_id is not null;
create index if not exists records_user_category_idx
  on public.records (user_id, category);

-- 更新時刻の自動更新
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_touch_updated_at on public.records;
create trigger records_touch_updated_at
  before update on public.records
  for each row execute function public.touch_updated_at();

-- ============================================================
-- flavor_vocab: 自分で足したフレーバーの言葉（系統ごとの配列）
-- ============================================================
create table if not exists public.flavor_vocab (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  words      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.flavor_vocab is '利用者が追加したフレーバー語彙。系統(coffee/tea/green/liquor/food/other)をキーにした配列';

drop trigger if exists flavor_vocab_touch_updated_at on public.flavor_vocab;
create trigger flavor_vocab_touch_updated_at
  before update on public.flavor_vocab
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 行レベルセキュリティ
-- 自分の行だけを読み書きできる。他人の記録には一切触れられない。
-- ============================================================
alter table public.records      enable row level security;
alter table public.flavor_vocab enable row level security;

drop policy if exists records_select_own on public.records;
create policy records_select_own on public.records
  for select using (auth.uid() = user_id);

drop policy if exists records_insert_own on public.records;
create policy records_insert_own on public.records
  for insert with check (auth.uid() = user_id);

drop policy if exists records_update_own on public.records;
create policy records_update_own on public.records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists records_delete_own on public.records;
create policy records_delete_own on public.records
  for delete using (auth.uid() = user_id);

drop policy if exists vocab_select_own on public.flavor_vocab;
create policy vocab_select_own on public.flavor_vocab
  for select using (auth.uid() = user_id);

drop policy if exists vocab_insert_own on public.flavor_vocab;
create policy vocab_insert_own on public.flavor_vocab
  for insert with check (auth.uid() = user_id);

drop policy if exists vocab_update_own on public.flavor_vocab;
create policy vocab_update_own on public.flavor_vocab
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists vocab_delete_own on public.flavor_vocab;
create policy vocab_delete_own on public.flavor_vocab
  for delete using (auth.uid() = user_id);
