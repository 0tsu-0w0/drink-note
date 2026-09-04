# Sip Notes

コーヒー・茶・お酒のテイスティングを、素性と味わいごと書き留めるノート。
どこの誰が作った一杯を、何と一緒に、どう味わったかを残します。

## 技術構成

| レイヤ | 技術 |
| :--- | :--- |
| Frontend / API | Next.js 16（App Router）、React 19、Server Actions |
| Database / Auth | Supabase（PostgreSQL + Supabase Auth、`@supabase/ssr`） |
| セッション管理 | `src/proxy.ts`（Next.js 16 の Proxy。旧 Middleware） |
| スタイル | 素の CSS（`src/app/globals.css`）。ライト／ダーク両対応 |

## 何を記録できるか

- **13カテゴリ** — コーヒー／紅茶／日本茶／日本酒／ビール／ワイン／サワー／焼酎／ウイスキー／リキュール／カクテル／ペアリング／その他
- **種類（style）** — カテゴリごとの選択肢。ワインの赤・白・ロゼ・スパークリング、ウイスキーのスコッチ・バーボンなど
- **種類で入れ替わる評価軸** — ワイン赤は ボディ・渋み・酸味、白は 酸味・香り・甘口度（辛口⇔甘口の双極軸）。ウイスキーはバーボン／アイリッシュ／ジャパニーズで軸が変わる
- **SCAJ カッピングフォーム** — コーヒーは8項目を各1〜8点、基礎点36を足して100点満点。80点がスペシャルティの目安
- **フレーバーノート** — SCA / World Coffee Research のフレーバーホイールの分類ほか。自分で言葉を足すと系統ごとに残る
- **素性** — 産地・農園・焙煎者・焙煎度（8段階）、蔵元・造り手・原料・年・度数、補助情報、場所
- **ペアリング** — 1つのフォームから飲みものと複数の一品を同時に保存し、`pair_id` で結ぶ

## セットアップ

### 1. Supabase プロジェクトを作る

1. [supabase.com](https://supabase.com) でプロジェクトを作成します。
2. **SQL Editor** で `supabase/migrations/001_init.sql` の中身を貼り付けて実行します。
   `records` と `flavor_vocab` の2テーブル、インデックス、行レベルセキュリティ（RLS）が作られます。
3. **Settings → API** から次の2つを控えます。どちらも公開してよい値です。
   - Project URL
   - `anon` / `publishable` key

> `service_role` キーはこのアプリでは使いません。フロントエンドのコードにも環境変数にも入れないでください。

### 2. 環境変数

```bash
cp .env.example .env.local
```

| 変数 | 説明 |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon キー |
| `NEXT_PUBLIC_SITE_URL` | アプリの公開 URL。確認メールのリンク先に使う（ローカルは `http://localhost:3000`） |

### 3. 認証のリダイレクト設定

Supabase の **Authentication → URL Configuration** に登録します。

- **Site URL:** `http://localhost:3000`（本番は Vercel の URL）
- **Redirect URLs:** `http://localhost:3000/auth/callback` と `https://<本番ドメイン>/auth/callback`

確認メールとパスワード再設定メールは、どちらもこの `/auth/callback` に戻ってきます。

メール確認を省きたい場合は **Authentication → Providers → Email** の
"Confirm email" を切ると、登録直後にそのままログインできます。

### 4. 開発サーバー

```bash
npm install
npm run dev
```

<http://localhost:3000> を開きます。

## Vercel へのデプロイ

1. GitHub リポジトリを Vercel にインポートします（フレームワークは Next.js が自動検出されます）。
2. **Environment Variables** に `.env.example` と同じ3つを設定します。
   `NEXT_PUBLIC_SITE_URL` は本番 URL にします。
3. デプロイ後、Supabase の Redirect URLs に本番の `/auth/callback` を追加します。

## スクリプト

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |

## セキュリティについて

- 記録と語彙のテーブルは RLS を有効にし、`auth.uid() = user_id` のポリシーだけを許可しています。
  他人の記録は読むことも書き換えることもできません。
- ブラウザに置かれる `anon` キーは公開前提の値です。実際のアクセス制御はデータベース側の
  ポリシーが行うため、キーが知られても他人のデータには届きません。
- パスワードの保管と検証は Supabase Auth が行い、このリポジトリのコードは平文のパスワードを
  保存も送信もしません。
- 再設定メールの送信は、宛先が登録済みかどうかで応答を変えません。どのアドレスが登録されて
  いるかを外から探れないようにするためです。

## 構成

```
src/
├── app/
│   ├── actions.ts          # Server Actions（認証・記録の CRUD・語彙）
│   ├── globals.css         # デザイントークンと全コンポーネントのスタイル
│   ├── layout.tsx
│   ├── page.tsx            # ランディング（ログイン済みなら /records へ）
│   ├── login/, signup/     # 認証画面
│   ├── reset/, reset/new/  # パスワードの再設定
│   ├── auth/callback/      # 確認メール・再設定メールからの戻り先
│   └── records/            # 一覧・新規・編集
├── components/
│   ├── header.tsx
│   ├── auth-form.tsx
│   ├── reset-forms.tsx
│   ├── record-form.tsx     # 記録フォーム（カテゴリ・種類・素性・評価軸・ペアリング）
│   └── records-view.tsx    # 一覧・概要・チャート・絞り込み
├── lib/
│   ├── domain.ts           # カテゴリ・種類・評価軸・素性・語彙の正本
│   ├── types.ts
│   └── supabase/           # ブラウザ用・サーバー用クライアント
└── proxy.ts                # セッション更新と保護ルート
supabase/migrations/001_init.sql
legacy/index.html           # 以前の単一ファイル版（ブラウザ内保存）
```

## 出典

- コーヒーの評価項目は日本スペシャルティコーヒー協会（SCAJ）のカッピングフォームに倣っています。
  基礎点36点＋8項目×最大8点＝100点満点、80点以上がスペシャルティコーヒーの目安。
  実際のカッピングは0.5点刻みですが、ここでは1点刻みです。
- フレーバーの語彙は SCA / World Coffee Research のコーヒーフレーバーホイールの分類、
  日本茶の「覆い香」「火香」などは日本茶の審査用語を参考にしました。
- 焙煎度はライトからイタリアンまでの8段階の慣用的な分類です。
