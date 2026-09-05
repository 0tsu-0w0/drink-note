# Vercel へのデプロイ

所要 10 分ほどです。順番が大事で、**URL が決まってから Supabase 側を直す**流れになります。

---

## 1. インポート

1. [vercel.com](https://vercel.com/) にログインします（GitHub アカウントで入るのが早いです）。
2. **Add New → Project** から `0tsu-0w0/drink-note` を選びます。
3. Framework Preset に **Next.js** が自動で入ります。Root Directory も既定のままで構いません。
4. **まだ Deploy を押さないでください。** 先に環境変数を入れます。

## 2. 環境変数

インポート画面の **Environment Variables** に3つ入れます。

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vfxbyjgrquhahrkwxkdn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の Settings → API にある anon / publishable key |
| `NEXT_PUBLIC_SITE_URL` | ひとまず `https://drink-note.vercel.app`（次の手順で確定させます） |

`service_role` キーは入れません。使いませんし、入れると行レベルセキュリティを
迂回できる鍵を置くことになります。

入れ終えたら **Deploy** を押します。

> 環境変数を入れ忘れるとビルドが止まり、ログに
> 「環境変数が設定されていません」と出ます。デプロイだけ成功して
> 開いた瞬間に落ちる、という事故は起きないようにしてあります。

## 3. 本番 URL を確定させる

デプロイが終わると URL が発行されます（`https://なにか.vercel.app`）。
**Settings → Domains** に出ている Production の URL を控えてください。

手順2で仮に入れた `NEXT_PUBLIC_SITE_URL` がこの URL と違っていたら、
**Settings → Environment Variables** で正しい値に直し、
**Deployments → 最新のもの → Redeploy** で入れ直します。

環境変数はビルド時に埋め込まれるため、**直したら必ず再デプロイが要ります。**

## 4. Supabase 側を本番 URL に合わせる

Supabase の **Authentication → URL Configuration** で次を設定します。

- **Site URL:** 本番 URL（例 `https://drink-note.vercel.app`）
- **Redirect URLs:** 次の2つを登録
  - `https://本番URL/auth/callback`
  - `http://localhost:3000/auth/callback`（手元で開発を続けるなら残します）

ここが合っていないと、登録の確認メールや再設定メールのリンクを開いても
「リンクが無効です」で弾かれます。

## 5. 動くか確かめる

本番 URL を開いて、次の順に試します。

1. トップページが表示される
2. 新規登録 → 確認メールが届く → リンクを開くと `/records` に入る
3. 記録を1件保存 → 一覧に出る
4. ログアウト → ログインし直すと記録が残っている

2 でメールが届かない場合は、Supabase の標準送信の制限（1時間に数通）に
当たっている可能性があります。[smtp-brevo.md](./smtp-brevo.md) の設定を先に済ませてください。

## 6. 以後の更新

`main` に push すると自動でデプロイされます。特別な操作は要りません。

---

## つまずいたときに見る場所

| 症状 | 見る場所 |
| :--- | :--- |
| ビルドが失敗する | Vercel の Deployments → 該当のビルドログ |
| 開くと「うまく表示できませんでした」 | Vercel の Logs（実行時のエラーが出ます） |
| メールのリンクが localhost に飛ぶ | `NEXT_PUBLIC_SITE_URL` と、再デプロイしたか |
| リンクを開くと「リンクが無効です」 | Supabase の Redirect URLs |
| メールが届かない | Supabase の Authentication → Rate Limits、送信元の設定 |
| ログインは通るが記録が出ない | Supabase の Table Editor で `records` に行があるか、RLS が有効か |
