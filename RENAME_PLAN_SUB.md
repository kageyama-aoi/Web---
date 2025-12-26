# リネーム・リンク修正計画 (サブディレクトリ: my-local-stack)

## 概要
`my-local-stack` ディレクトリ配下のHTMLファイルに対し、ファイル名を日本語化し、作成日に基づくタイムスタンプを付与します。
また、リネームに伴い、親ディレクトリのポータルサイトおよびサブディレクトリ内のポータルサイトのリンク切れを修正します。

## 1. リネーム一覧案 (`my-local-stack/` 配下)

| 現在のファイル名 | 作成日 | 変更後のファイル名案 | 備考 |
| :--- | :--- | :--- | :--- |
| `guide-docker-php-mysql-crud.html` | 2025/08/25 | `20250825_Docker_PHP_MySQLローカル開発ガイド.html` | |
| `guide-vps-docker-mysql.html` | 2025/08/25 | `20250825_VPS_Docker_MySQL実践ハンドブック.html` | |
| `guide-vps-github-actions-deploy.html` | 2025/08/26 | `20250826_VPS_GitHubActions自動デプロイハンドブック.html` | |
| `index.html` | 2025/08/26 | `20250826_LocalStack資料一覧ポータル.html` | 親ディレクトリのポータルと区別しやすい名前に設定 |
| `log-20240825-learnings.html` | 2025/08/25 | `20250825_学習ログ_phpMyAdmin設定とパーミッション問題.html` | |
| `production_checklist_handbook.html` | 2025/08/26 | `20250826_Webアプリ公開本番環境チェックリスト.html` | |
| `spreadsheet-links.html` | 2025/08/26 | `20250826_スプレッドシートリンク集.html` | |

※ `.env`, `docker-compose.yml`, `spreadsheet-data-default.json` などの設定・データファイルは変更対象外とします。

## 2. リンク修正計画

リネーム実行後、以下のファイル内のリンクを置換します。

### A. 親ポータル (`../20250826_資料一覧ポータル.html`) の修正
`./my-local-stack/` 以下のファイルへのリンクを新ファイル名に更新します。

*   `guide-vps-github-actions-deploy.html` -> `20250826_VPS_GitHubActions自動デプロイハンドブック.html`
*   `guide-vps-docker-mysql.html` -> `20250825_VPS_Docker_MySQL実践ハンドブック.html`
*   `memo-20240825-learnings.html` (※要確認) -> `20250825_学習ログ_phpMyAdmin設定とパーミッション問題.html` (内容が一致する場合)
*   その他リンクがあれば対応

### B. サブディレクトリポータル (`my-local-stack/20250826_LocalStack資料一覧ポータル.html`) の修正
自身のディレクトリ内の他ファイルへのリンクを新ファイル名に更新します。

## 次のステップ
この計画で問題なければ、リネームとリンク修正を一括して行うスクリプトを作成・実行します。
