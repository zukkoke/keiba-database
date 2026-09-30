# KEIBA DATABASE

Vite + React + Supabase で作る競走馬レースメモDBの初版。

## 必要環境
- Node.js 20.19+ または 22.12+
- Supabaseアカウント

## 起動
npm install
npm run dev

## Supabase
1. Supabaseで新規プロジェクトを作成
2. SQL Editorで `supabase/schema.sql` を実行
3. Project ConnectからURLとPublishable Keyを取得
4. `.env.local` を作成し、`.env.example` の値を設定
5. 管理者ユーザーをSupabase Authで作成
6. 管理者UUIDを確認し、schema.sqlのinsert/update/deleteポリシーを有効化

## 方針
- 公開ページ: 誰でもレースデータを閲覧
- 管理画面: 管理者のみログインして登録・編集・削除
- スマホ対応
