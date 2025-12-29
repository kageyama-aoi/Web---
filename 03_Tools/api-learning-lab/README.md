# API Learning Lab

**API Learning Lab** は、HTTPリクエストとレスポンスの仕組みを「見て、触って、学ぶ」ための軽量なWebアプリケーションです。
面倒な環境構築は不要。`index.html` をブラウザで開くだけで、実際のAPIを叩きながら学習を始められます。

## 🚀 主な機能

1.  **Request Builder (リクエスト作成)**
    *   **プリセット機能**: 学習用に厳選された公開API（為替、天気、国情報など）をリストから選ぶだけで、すぐにリクエストを送信できます。
    *   **パラメータ設定**: クエリパラメータ、HTTPヘッダー、JSONボディをGUIで直感的に追加・編集できます。
    *   **cURL 自動生成**: 設定した内容に合わせて `curl` コマンドをリアルタイムに生成。CLIでの実行方法も同時に学べます（Windows/Mac/Linux対応）。

2.  **Results Inspector (結果の観察)**
    *   **詳細なステータス**: HTTPステータスコード、応答時間、データサイズ、Content-Typeを一目で確認。
    *   **JSON ビューア**: レスポンスのJSONを「ツリー形式」または「テーブル形式」で整形表示。構造が複雑なデータも直感的に理解できます。
    *   **Rawデータ確認**: 生のテキストデータやレスポンスヘッダーもタブ切り替えで確認可能。

3.  **OAuth 2.0 (PKCE) 学習**
    *   **認証フローの実演**: OAuth 2.0 の Authorization Code Flow + PKCE (Proof Key for Code Exchange) の流れを体験できる専用パネルを搭載。
    *   `code_verifier` や `code_challenge` の生成からトークン交換までをステップバイステップで実行できます。

## 📦 インストールと実行方法

本ツールは静的なHTML/JSのみで動作するため、特別なサーバやビルドツールは不要です。

1.  このフォルダ一式をダウンロード（またはClone）します。
2.  フォルダ内の **`index.html`** をダブルクリックして、ブラウザ（Chrome, Edge, Firefox等）で開いてください。
3.  画面左上のプルダウンから「サンプルAPI」を選び、「▶ 送信」ボタンを押してみてください。

## 📂 ファイル構成

```text
.
├── index.html          # アプリケーションのメインファイル（UI構造）
├── style.css           # デザインとレイアウト
├── script.js           # アプリケーションのロジック（DOM操作、fetch処理、OAuth制御）
├── data/
│   ├── presets.js      # APIプリセットデータ（window.API_PRESETS を定義）
│   └── presets.json    # プリセットデータのソース（バックアップ・編集用）
└── DEBUG_REPORT.md     # トラブルシューティングの記録
```

## ⚠️ 注意事項とTips

*   **CORS (Cross-Origin Resource Sharing) 制約について**
    *   ブラウザから直接APIを叩く仕組み上、CORSヘッダー（`Access-Control-Allow-Origin`）を許可していないAPIサーバーにはリクエストがブロックされることがあります。
    *   学習用プリセットに含まれているAPIは、基本的にCORSを許可しているものを選定しています。
    *   独自のAPIを試す場合でCORSエラーが出る際は、サーバー側の設定を確認するか、ローカルプロキシなどを経由する必要があります。

*   **プリセットの編集**
    *   新しいAPIを追加したい場合は、`data/presets.js` を編集するか、`data/presets.json` を編集した後に指定のフォーマットで `.js` に変換してください。
    *   **注意**: `presets.js` を保存する際は、必ず **UTF-8 (BOMなし)** エンコーディングを使用してください。Shift_JISなどで保存すると読み込みエラーになります。

## 🛠 技術スタック
*   HTML5 / CSS3 (Grid, Flexbox, CSS Variables)
*   Vanilla JavaScript (ES6+)
*   No Frameworks, No Libraries (純粋な標準技術のみで構成)
