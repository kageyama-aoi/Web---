# Mermaid Live Viewer リファクタリング提案書

## 1. はじめに

現在の `mermaid_viewer_20250903.html` は、単一のHTMLファイルで完結しており、配布や利用が非常に手軽であるという大きな利点があります。

この提案は、その利点を可能な限り維持しつつ、今後の機能追加やメンテナンスを容易にするために、コード構造を改善することを目的としています。

**リファクタリングの主な目的:**
- **保守性の向上**: コードの役割を明確にし、修正箇所を特定しやすくします。
- **拡張性の向上**: 新機能の追加を容易にします。
- **可読性の向上**: コードの意図を理解しやすくします。

---

## 2. リファクタリング提案

### 2.1. 関心の分離 (ファイル分割)

現在、HTML、CSS、JavaScriptが1つのファイルに混在しています。これをそれぞれの役割に応じてファイルに分割します。

- **`index.html`**: アプリケーションの骨格となるHTML構造のみを記述します。
- **`style.css`**: UIのスタイル情報を記述します。
- **`app.js`**: アプリケーションの動作ロジックを記述します。

これにより、それぞれの言語が担当する範囲が明確になります。

**変更後の `index.html` の `<head>` タグの例:**
```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mermaid Live Viewer (Single HTML)</title>
  <meta name="description" content="Mermaidのフローチャート等をブラウザで書いて即プレビュー、SVG/PNGで保存できる単一HTMLアプリ" />
  <!-- CSSファイルを読み込み -->
  <link rel="stylesheet" href="style.css">
  <!-- Mermaid.jsを読み込み -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
  <!-- アプリケーションのJavaScriptを読み込み (defer属性でHTML解析後に実行) -->
  <script src="app.js" defer></script>
</head>
```

### 2.2. JavaScriptのモジュール化

`app.js` の中身を、機能ごとに小さなモジュール（ファイル）に分割し、ES Modules (`import`/`export`) を使って連携させます。これにより、各機能の独立性が高まり、コードの見通しが格段に良くなります。

**ファイル構成案:**
```
mermaid_viewer/
├── index.html
├── style.css
└── js/
    ├── app.js          # メインファイル (各モジュールを読み込む)
    ├── ui.js           # UI操作、DOMイベント、表示更新
    ├── mermaid-handler.js # Mermaidのレンダリング、構文チェック
    ├── file-handler.js # ファイル保存/読込、SVG/PNGエクスポート
    ├── state-handler.js  # localStorageやURLハッシュによる状態管理
    └── samples.js      # サンプルコードのデータ
```

**`app.js` (メインファイル) の例:**
```javascript
// js/app.js
import { initializeUI, addEventListeners } from './ui.js';
import { initializeMermaid } from './mermaid-handler.js';
import { loadInitialState } from './state-handler.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. UI要素を初期化
  const elements = initializeUI();

  // 2. 状態を復元 (localStorageやURLから)
  const initialState = loadInitialState();

  // 3. Mermaidを初期化
  initializeMermaid(initialState.theme);

  // 4. イベントリスナーを設定
  addEventListeners(elements);

  // 5. 初期コードで初回レンダー
  elements.editor.value = initialState.code;
  elements.renderBtn.click();
});
```

### 2.3. 状態管理の一元化

アプリケーションの状態（エディタのコード、テーマ、UI配色など）を1つのオブジェクトに集約して管理します。これにより、データの流れが追跡しやすくなります。

**状態オブジェクトの例:**
```javascript
// js/state-handler.js
const appState = {
  code: '',
  theme: 'default',
  scheme: 'auto',
  scale: 2,
  // ...その他の状態
};

export function getState() {
  return appState;
}

export function updateCode(newCode) {
  appState.code = newCode;
  // ここでlocalStorageへの保存も行う
}
```

### 2.4. 定数によるマジックストリングの排除

`localStorage` のキー名や、サンプルデータのキー名など、コード内に直接記述されている文字列（マジックストリング）を定数として一箇所にまとめます。これにより、タイポによるバグを防ぎ、変更も容易になります。

**定数ファイルの例:**
```javascript
// js/constants.js
export const LS_KEYS = {
  CODE: 'mermaid_viewer_code',
  THEME: 'mermaid_viewer_theme',
  SCHEME: 'mermaid_viewer_scheme',
};

export const DEFAULT_CODE = `flowchart TD\n  A --> B`;
```

---

## 3. まとめ

上記のリファクタリングを行うことで、コードはより構造化され、今後の開発がスムーズになります。

1.  まず **「2.1. 関心の分離」** から着手し、ファイルを分割する。
2.  次に **「2.2. JavaScriptのモジュール化」** を進め、機能ごとにファイルを分割していく。

というように、段階的に進めることをお勧めします。