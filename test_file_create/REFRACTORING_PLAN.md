# `script.js` リファクタリング計画

## 目的
`script.js` のコードベースを改善し、可読性、保守性、拡張性を向上させる。

## 現状の課題
- **モノリシックな構造**: 全てのロジックが単一ファイルに集約されており、コードの見通しが悪い。
- **グローバルスコープの汚染**: 多くの関数がグローバルスコープに定義されており、名前の衝突や依存関係の不明瞭さを引き起こす可能性がある。
- **UIロジックとデータロジックの混在**: UI操作とデータ処理・生成ロジックが密接に結合している。
- **重複コード**: 一部のDOMクエリや処理に重複が見られる。
- **複雑な `generate()` 関数**: フォーマットごとの分岐が多く、肥大化している。
- **マジックストリング/ナンバー**: デリミタやフォーマットタイプなどがハードコードされている箇所がある。
- **EDI固有ロジックの分離不足**: EDIの固定長生成やバリデーションロジックが他の汎用ロジックと混在している。

## リファクタリングのステップ（段階的に実施）

### フェーズ1: モジュール化と責務の分離
1.  **`PRESETS` データの分離**: `PRESETS` 定義を別のファイル（例: `data/presets.js`）に移動し、必要に応じてインポートする形式にする。
2.  **UIヘルパー関数の分離**: `$`, `$$`, `getCurrentPreset`, `getPreset`, `getFormat`, `getDelimiter`, `getNewline`, `withHeader`, `extFor`, `applyPresetDefaults`, `updateControlAvailability`, `headerLabels` などのUI関連関数を `ui.js` または `domUtils.js` のようなファイルに分離する。
3.  **文字列ユーティリティ関数の分離**: `newlineify`, `csvQuote`, `onlyDigits`, `padLeftZero`, `padRightSpace`, `padLeftSpace` などの汎用文字列操作関数を `utils/stringUtils.js` のようなファイルに分離する。
4.  **EDI固有ロジックの分離**: `ediHeader`, `ediEnd`, `storeCode3`, `ediDataRow`, `ediTrailer`, `generateEDI2000Fixed`, `validateEDI` などのEDI関連関数を `formatters/ediFormatter.js` のようなファイルに分離する。
5.  **各フォーマット生成関数の分離**: `toCSVTSV`, `toJSON`, `toYAML`, `toXML`, `toMarkdown`, `toTXT`, `toHTML`, `toSQL`, `toFIXED_generic` を `formatters/` ディレクトリ配下の各ファイル（例: `formatters/csvFormatter.js`, `formatters/jsonFormatter.js` など）に分離する。

### フェーズ2: `generate()` 関数の改善とイベントハンドリング
1.  **`generate()` 関数のリファクタリング**:
    *   各フォーマット生成関数をモジュールとしてインポートし、`generate()` 関数内で動的に呼び出すように変更する（例: フォーマットタイプと関数をマッピングしたオブジェクトを使用）。
    *   `generate()` 関数からUI更新ロジック（`$("#preview").value = text;` など）を分離し、専用の関数またはUIモジュールに移動する。
2.  **イベントハンドリングの整理**: イベントリスナーの登録部分を関数にまとめ、初期化処理を明確にする。

### フェーズ3: コード品質の向上
1.  **命名規則の統一**: 変数名、関数名が意図を明確に伝えるように見直す。
2.  **コメントの整理**: 複雑なロジックや意図を説明するコメントに限定し、冗長なコメントは削除する。
3.  **ESLint/Prettierの導入検討**: コードスタイルを自動で統一するためのツール導入を検討する（もしプロジェクトにない場合）。

## 実施方法
- 各フェーズ、各ステップごとに小さな変更を加え、動作確認を行う。
- 変更を加える前に、関連するコードのバックアップを取るか、バージョン管理システム（Gitなど）を使用する。

---

**次のステップ**: つぎはフェーズ2から着手します。
