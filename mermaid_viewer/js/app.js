import { DEFAULT_CODE, SAMPLES, SAMPLE_LABELS, SAMPLE_ORDER } from './samples.js';
import { loadState, saveState, loadFromHash, updateShareState, canUseHistory, canUseHash } from './state.js';
import { initMermaid, renderDiagram } from './renderer.js';
import { setStatus, showError, clearError, applyScheme, populateSamplesDropdown } from './ui.js';
import { getDomRefs } from './dom.js';
import { bindAppEvents } from './events.js';

const refs = getDomRefs();

// =============== Render callbacks ===============
const callbacks = {
  onStatus:      (msg) => setStatus(refs.statusEl, msg),
  onError:       (err) => { showError(refs.errorBox, err); setStatus(refs.statusEl, ''); },
  onClearError:  ()    => clearError(refs.errorBox),
  onEditorUpdate:(code) => { refs.editor.value = code; },
  onShareUpdate: (code) => {
    saveState({ code });
    if (canUseHistory() || canUseHash()) updateShareState(code);
  },
};

function render() {
  return renderDiagram(refs.editor.value.trim(), refs.preview, callbacks);
}

bindAppEvents({ refs, render });

// =============== 初期ロード ===============
function init() {
  populateSamplesDropdown(refs.examples, { SAMPLES, SAMPLE_LABELS, SAMPLE_ORDER });

  const saved = loadState();

  const savedScheme = saved.scheme || 'auto';
  refs.schemeSel.value = savedScheme;
  applyScheme(savedScheme);

  const savedTheme = saved.theme || 'default';
  refs.themeSel.value = savedTheme;

  const fromHash = loadFromHash();
  refs.editor.value = fromHash || saved.code || DEFAULT_CODE;

  const onReady = () => { initMermaid(savedTheme); render(); };
  if (window.mermaid) { onReady(); } else { window.addEventListener('load', onReady, { once: true }); }
}

init();
