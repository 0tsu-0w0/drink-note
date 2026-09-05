# メール送信元の設定（Brevo）

独自ドメインを持っていない場合の手順です。自分のメールアドレス（Gmail など）を
送信元として認証するだけで使え、DNS の設定は要りません。

> **SMTP キーは誰にも渡さないでください。** Supabase のダッシュボードに直接入力します。
> リポジトリにも、このアプリの環境変数にも入れません（メール送信は Supabase 側が行います）。

---

## 1. Brevo に登録して送信元を認証する

1. [brevo.com](https://www.brevo.com/) でアカウントを作成します。
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender** で、
   送信元にしたいメールアドレス（自分の Gmail など）を登録します。
3. そのアドレス宛に確認メールが届くので、リンクを開いて認証します。

認証していないアドレスからは送信できません。ここを飛ばすと後で必ず詰まります。

## 2. SMTP キーを発行する

1. 右上のアカウントメニュー → **SMTP & API** を開きます。
2. **SMTP** タブに、接続情報が表示されます。
3. **Generate a new SMTP key** でキーを作ります。
   このキーが SMTP のパスワードになります。**アカウントのログインパスワードでも、
   API v3 キーでもありません。**

> 作りたてのアカウントでは、SMTP の有効化に Brevo 側の確認が要ることがあります。
> 「SMTP is not activated」のような表示が出たら、案内に従って利用目的を申請してください。
> 数時間から1営業日ほどで通ります。

## 3. Supabase に入力する

Supabase の **Authentication → Emails → SMTP Settings** で
**Enable Custom SMTP** をオンにし、次を入れます。

| 項目 | 入れる値 |
| :--- | :--- |
| Sender email | 手順1で認証したメールアドレス |
| Sender name | `Sip Notes` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | Brevo の SMTP タブに表示されている **Login**（`########@smtp-brevo.com` の形） |
| Password | 手順2で作った **SMTP キー** |

**Host・Port・Username は、必ず Brevo の SMTP タブに表示されている値をそのまま写してください。**
上の表は目安で、アカウントによって異なることがあります。

保存したら **Authentication → Rate Limits** を開き、
`Rate limit for sending emails` を実際に必要な数（例: 1時間あたり 30〜100）に上げます。
標準送信のときの数通のままだと、せっかく SMTP を繋いでも制限に当たります。

## 4. 文面を日本語にする

**Authentication → Emails** で、種類ごとに件名と本文を差し替えます。
文面は [email-templates.md](./email-templates.md) にあります。

## 5. 届くか確かめる

本番 URL の `/reset` を開き、**自分のメールアドレス**で再設定リンクを送ります。

- 届いた → 差出人が `Sip Notes <認証したアドレス>` になっているか確認します。
- 届かない → 迷惑メールを見てください。それでも無ければ Brevo の
  **Transactional → Logs** に送信の記録が残っているはずです。
  ここに何も無ければ Supabase から Brevo へ届いていないので、
  Host・Port・Username・パスワードを見直します。

登録の確認メールも同じ経路で送られるので、片方が届けば両方動いています。

---

## 無料枠について

Brevo の無料プランは 1 日あたりの送信数に上限があります（執筆時点で 300 通程度）。
個人が知人に配る規模なら十分ですが、最新の条件は Brevo の料金ページで確認してください。
上限に達すると、その日は登録も再設定もできなくなります。

## 迷惑メールに入りにくくするために

送信元が Gmail などのフリーメールだと、どうしても迷惑メール判定されやすくなります。
配る相手が限られているなら、事前に「Sip Notes から確認メールが届く」と伝え、
迷惑メールフォルダも見てもらうのが確実です。

将来ドメインを取得したら、Brevo でドメイン認証（SPF・DKIM）をするか、
Resend などに乗り換えると到達率が上がります。
