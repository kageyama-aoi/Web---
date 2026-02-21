import { PNG_SCALE, MIME } from './constants.js';
import { DEFAULT_CODE, SAMPLES, SAMPLE_LABELS, SAMPLE_ORDER } from './samples.js';
import { loadState, saveState, loadFromHash, updateShareState, canUseHistory, canUseHash, encodeCode, decodeCode, isSandboxed } from './state.js';
import { initMermaid, renderDiagram, scheduleRender } from './renderer.js';
import { copyText, saveBlob, copySvg, downloadSvg, downloadPng } from './exporter.js';
import { setStatus, showError, clearError, applyScheme, populateSamplesDropdown } from './ui.js';

// =============== DOM refs ===============
const editor    = document.querySelector('#editor');
const preview   = document.querySelector('#preview');
const errorBox  = document.querySelector('#error');
const renderBtn = document.querySelector('#renderBtn');
const autorun   = document.querySelector('#autorun');
const themeSel  = document.querySelector('#theme');
const schemeSel = document.querySelector('#scheme');
const scaleInput = document.querySelector('#scale');
const fileInput = document.querySelector('#fileInput');
const statusEl  = document.querySelector('#status');
const examples  = document.querySelector('#examples');

// =============== Render callbacks ===============
const callbacks = {
  onStatus:      (msg) => setStatus(statusEl, msg),
  onError:       (err) => { showError(errorBox, err); setStatus(statusEl, ''); },
  onClearError:  ()    => clearError(errorBox),
  onEditorUpdate:(code) => { editor.value = code; },
  onShareUpdate: (code) => {
    saveState({ code });
    if (canUseHistory() || canUseHash()) updateShareState(code);
  },
};

function render() {
  return renderDiagram(editor.value.trim(), preview, callbacks);
}

// =============== イベント ===============
editor.addEventListener('input', () => { if (autorun.checked) scheduleRender(render); });
renderBtn.addEventListener('click', render);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); render(); }
});

themeSel.addEventListener('change', () => {
  initMermaid(themeSel.value);
  render();
  saveState({ theme: themeSel.value });
});

schemeSel.addEventListener('change', () => applyScheme(schemeSel.value));

const loadSelectedSample = () => {
  const k = examples.value;
  if (!k) return;
  editor.value = SAMPLES[k] || DEFAULT_CODE;
  render();
};
document.querySelector('#loadSample').addEventListener('click', loadSelectedSample);
examples.addEventListener('change', loadSelectedSample);

document.querySelector('#openFile').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  editor.value = await f.text();
  render();
});

document.querySelector('#saveMmd').addEventListener('click', () => {
  saveBlob(editor.value, 'diagram.mmd', MIME.TEXT);
});

document.querySelector('#copySvg').addEventListener('click', async () => {
  const ok = await copySvg(preview);
  setStatus(statusEl, ok ? 'SVGをクリップボードにコピーしました' : 'コピーできませんでした（権限未許可）');
});

document.querySelector('#downloadSvg').addEventListener('click', async () => {
  try {
    const result = await downloadSvg(preview);
    if      (result.method === 'blob')      setStatus(statusEl, 'SVGを保存しました');
    else if (result.method === 'tab')       setStatus(statusEl, '新規タブでSVGを開きました（そこで保存できます）');
    else if (result.method === 'clipboard') setStatus(statusEl, '環境制限で自動保存不可。SVGをクリップボードにコピーしました。');
    else                                    setStatus(statusEl, '保存・コピーに失敗しました。PNG保存や.mmd保存をご利用ください。');
  } catch (e) { showError(errorBox, e); }
});

document.querySelector('#downloadPng').addEventListener('click', async () => {
  try {
    const scale = Math.max(PNG_SCALE.MIN, Math.min(PNG_SCALE.MAX, Number(scaleInput.value) || PNG_SCALE.DEFAULT));
    await downloadPng(preview, scale);
    setStatus(statusEl, `PNGを保存しました（倍率×${scale}）`);
  } catch (e) { showError(errorBox, e); }
});

document.querySelector('#shareUrl').addEventListener('click', async () => {
  const code = editor.value.trim();
  const res = updateShareState(code);
  if (res.ok) {
    const ok = await copyText(location.href);
    setStatus(statusEl, ok ? `共有URLをコピーしました（方式：${res.method}）` : 'URLのコピーに失敗しました');
  } else {
    const encoded = encodeCode(code);
    const ok = await copyText(encoded);
    setStatus(statusEl, ok
      ? 'URL更新不可の環境です。代わりに「エンコード済みコード」をコピーしました。別環境で貼り付けてお使いください。'
      : '共有不可の環境です（クリップボード未許可）。.mmd保存をご利用ください。');
  }
});

// =============== 自己テスト ===============
document.querySelector('#selfTest').addEventListener('click', () => {
  const tests = [];
  function add(name, fn) { try { const ok = !!fn(); tests.push({ name, ok }); } catch (e) { tests.push({ name, ok: false, e }); } }
  add('encode/decode ASCII', () => { const s = 'flowchart TD\nA-->B'; return decodeCode(encodeCode(s)) === s; });
  add('encode/decode JP',    () => { const s = '開始→承認?'; return decodeCode(encodeCode(s)) === s; });
  add('sandbox detect',      () => typeof isSandboxed() === 'boolean');
  add('gitGraph v10 parse',  () => { window.mermaid.parse(SAMPLES.git); return true; });
  add('flowchart parse',     () => { window.mermaid.parse(SAMPLES.flow); return true; });
  add('gantt parse',         () => { window.mermaid.parse(SAMPLES.gantt); return true; });
  add('git dev/shishi cp parse', () => { window.mermaid.parse(SAMPLES['git_dev_shishi_cp']); return true; });
  add('env_flow parse',      () => { window.mermaid.parse(SAMPLES['env_flow']); return true; });
  add('env_gantt parse',     () => { window.mermaid.parse(SAMPLES['env_gantt']); return true; });
  console.table(tests);
  const okAll = tests.every(t => t.ok);
  setStatus(statusEl, '自己テスト: ' + (okAll ? 'OK' : '一部NG（コンソールを確認）'));
});

// =============== 初期ロード ===============
function init() {
  populateSamplesDropdown(examples, { SAMPLES, SAMPLE_LABELS, SAMPLE_ORDER });

  const saved = loadState();

  const savedScheme = saved.scheme || 'auto';
  schemeSel.value = savedScheme;
  applyScheme(savedScheme);

  const savedTheme = saved.theme || 'default';
  themeSel.value = savedTheme;

  const fromHash = loadFromHash();
  editor.value = fromHash || saved.code || DEFAULT_CODE;

  const onReady = () => { initMermaid(savedTheme); render(); };
  if (window.mermaid) { onReady(); } else { window.addEventListener('load', onReady, { once: true }); }
}

init();
