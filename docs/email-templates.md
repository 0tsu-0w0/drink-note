# メール文面

Supabase の **Authentication → Emails** で、種類ごとに件名と本文を差し替えます。
既定は英語なので、日本語のまま配ると受け取った人に不審に見えます。

`{{ .ConfirmationURL }}` などは Supabase が差し込む変数です。**そのまま残してください。**

---

## Confirm signup（新規登録の確認）

**件名**

```
Sip Notes のメールアドレス確認
```

**本文**

```html
<div style="font-family:-apple-system,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;line-height:1.8;color:#181B17;max-width:520px">
  <p style="font-size:20px;font-weight:700;letter-spacing:.02em;margin:0 0 20px">Sip Notes</p>

  <p style="margin:0 0 16px">Sip Notes にご登録いただきありがとうございます。</p>
  <p style="margin:0 0 24px">下のボタンからメールアドレスの確認を済ませると、記録を始められます。</p>

  <p style="margin:0 0 24px">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#2C5B45;color:#F8F9F6;text-decoration:none;padding:12px 22px;border-radius:2px;font-weight:700;letter-spacing:.08em">
      メールアドレスを確認する
    </a>
  </p>

  <p style="margin:0 0 8px;font-size:13px;color:#6A7266">
    ボタンが動かない場合は、次のURLをブラウザに貼り付けてください。
  </p>
  <p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#6A7266">
    {{ .ConfirmationURL }}
  </p>

  <p style="margin:0;font-size:12.5px;color:#6A7266;border-top:1px solid #D5D9CF;padding-top:16px">
    このメールに心当たりがない場合は、何もせずに破棄してください。<br>
    リンクを開かないかぎりアカウントは有効になりません。
  </p>
</div>
```

---

## Reset Password（パスワードの再設定）

**件名**

```
Sip Notes のパスワード再設定
```

**本文**

```html
<div style="font-family:-apple-system,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;line-height:1.8;color:#181B17;max-width:520px">
  <p style="font-size:20px;font-weight:700;letter-spacing:.02em;margin:0 0 20px">Sip Notes</p>

  <p style="margin:0 0 16px">パスワードの再設定が申請されました。</p>
  <p style="margin:0 0 24px">下のボタンから、新しいパスワードを設定してください。</p>

  <p style="margin:0 0 24px">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#2C5B45;color:#F8F9F6;text-decoration:none;padding:12px 22px;border-radius:2px;font-weight:700;letter-spacing:.08em">
      新しいパスワードを設定する
    </a>
  </p>

  <p style="margin:0 0 8px;font-size:13px;color:#6A7266">
    ボタンが動かない場合は、次のURLをブラウザに貼り付けてください。
  </p>
  <p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#6A7266">
    {{ .ConfirmationURL }}
  </p>

  <p style="margin:0;font-size:12.5px;color:#6A7266;border-top:1px solid #D5D9CF;padding-top:16px">
    申請した覚えがない場合は、何もせずに破棄してください。<br>
    このメールだけでパスワードが変わることはありません。
  </p>
</div>
```

---

## Change Email Address（メールアドレスの変更）

このアプリの画面からは使いませんが、既定の英語文が残らないように差し替えておきます。

**件名**

```
Sip Notes のメールアドレス変更
```

**本文**

```html
<div style="font-family:-apple-system,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;line-height:1.8;color:#181B17;max-width:520px">
  <p style="font-size:20px;font-weight:700;letter-spacing:.02em;margin:0 0 20px">Sip Notes</p>

  <p style="margin:0 0 16px">メールアドレスの変更が申請されました。</p>
  <p style="margin:0 0 24px">
    {{ .Email }} から {{ .NewEmail }} への変更を確定するには、下のボタンを押してください。
  </p>

  <p style="margin:0 0 24px">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#2C5B45;color:#F8F9F6;text-decoration:none;padding:12px 22px;border-radius:2px;font-weight:700;letter-spacing:.08em">
      変更を確定する
    </a>
  </p>

  <p style="margin:0;font-size:12.5px;color:#6A7266;border-top:1px solid #D5D9CF;padding-top:16px">
    申請した覚えがない場合は、何もせずに破棄してください。
  </p>
</div>
```

---

## 送信元の表示名

SMTP を設定すると、差出人の表示名も指定できます。
**Authentication → Emails → SMTP Settings** の Sender name を `Sip Notes` にしておくと、
受信箱で誰からのメールか一目で分かります。

## 迷惑メールに入りにくくするために

- 送信元アドレスは、認証済みのドメイン（または送信サービスで認証したアドレス）を使う
- 独自ドメインを使う場合は、送信サービスの案内どおり SPF・DKIM のDNSレコードを設定する
- 件名に「無料」「今すぐ」などの語を入れない
