import { DEBOUNCE_DELAY } from './constants.js';

export function initMermaid(theme) {
  window.mermaid.initialize({ startOnLoad: false, theme: theme || 'default', securityLevel: 'loose' });
}

// gitGraph 互換フィックス（v10系で tag 行が文法外のケース向け）
export function compatFixGitGraph(code) {
  if (!/^\s*gitGraph/m.test(code)) return null;
  // 独立した `tag "xxx"` 行を `commit tag: "xxx"` に置換
  const fixed = code.replace(/^\s*tag\s+"([^"]+)"\s*$/gm, '  commit tag: "$1"');
  return fixed !== code ? fixed : null;
}

/**
 * @param {string} code
 * @param {HTMLElement} previewEl
 * @param {{ onStatus, onError, onClearError, onEditorUpdate, onShareUpdate }} callbacks
 * @param {boolean} _attemptedFix  内部再帰用フラグ
 */
export async function renderDiagram(code, previewEl, callbacks, _attemptedFix = false) {
  const { onStatus, onError, onClearError, onEditorUpdate, onShareUpdate } = callbacks;
  if (!code) { previewEl.innerHTML = ''; onClearError(); onStatus(''); return; }
  try {
    onClearError();
    window.mermaid.parse(code); // 構文チェック
    const id = 'm' + Math.random().toString(36).slice(2);
    const { svg, bindFunctions } = await window.mermaid.render(id, code);
    previewEl.innerHTML = svg;
    bindFunctions && bindFunctions(previewEl);
    onStatus('レンダー完了');
    onShareUpdate(code);
  } catch (e) {
    // gitGraphの互換フィックスを試行
    if (!_attemptedFix) {
      const fixed = compatFixGitGraph(code);
      if (fixed) {
        onEditorUpdate(fixed);
        onStatus('gitGraph互換フィックス適用: `tag "…"` → `commit tag: "…"`');
        return renderDiagram(fixed, previewEl, callbacks, true);
      }
    }
    onError(e);
  }
}

let _timer;
export function scheduleRender(callback, delay = DEBOUNCE_DELAY) {
  clearTimeout(_timer);
  _timer = setTimeout(callback, delay);
}
