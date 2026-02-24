import { PNG_SCALE, MIME } from './constants.js';
import { DEFAULT_CODE, SAMPLES } from './samples.js';
import { saveState, updateShareState, encodeCode, decodeCode, isSandboxed } from './state.js';
import { initMermaid, scheduleRender } from './renderer.js';
import { copyText, saveBlob, copySvg, downloadSvg, downloadPng } from './exporter.js';
import { setStatus, showError, applyScheme } from './ui.js';
import { runSelfTest } from './selfTest.js';

export function bindAppEvents({ refs, render }) {
  const {
    editor, preview, errorBox, renderBtn, autorun, themeSel, schemeSel, scaleInput, fileInput, statusEl, examples,
    loadSampleBtn, openFileBtn, saveMmdBtn, copySvgBtn, downloadSvgBtn, downloadPngBtn, shareUrlBtn, selfTestBtn,
  } = refs;

  editor.addEventListener('input', () => {
    if (autorun.checked) scheduleRender(render);
  });

  renderBtn.addEventListener('click', render);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      render();
    }
  });

  themeSel.addEventListener('change', () => {
    initMermaid(themeSel.value);
    render();
    saveState({ theme: themeSel.value });
  });

  schemeSel.addEventListener('change', () => applyScheme(schemeSel.value));

  const loadSelectedSample = () => {
    const key = examples.value;
    if (!key) return;
    editor.value = SAMPLES[key] || DEFAULT_CODE;
    render();
  };
  loadSampleBtn.addEventListener('click', loadSelectedSample);
  examples.addEventListener('change', loadSelectedSample);

  openFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    editor.value = await file.text();
    render();
  });

  saveMmdBtn.addEventListener('click', () => {
    saveBlob(editor.value, 'diagram.mmd', MIME.TEXT);
  });

  copySvgBtn.addEventListener('click', async () => {
    const ok = await copySvg(preview);
    setStatus(statusEl, ok ? 'SVGをクリップボードにコピーしました' : 'コピーできませんでした（権限未許可）');
  });

  downloadSvgBtn.addEventListener('click', async () => {
    try {
      const result = await downloadSvg(preview);
      if (result.method === 'blob') setStatus(statusEl, 'SVGを保存しました');
      else if (result.method === 'tab') setStatus(statusEl, '新規タブでSVGを開きました（そこで保存できます）');
      else if (result.method === 'clipboard') setStatus(statusEl, '環境制限で自動保存不可。SVGをクリップボードにコピーしました。');
      else setStatus(statusEl, '保存・コピーに失敗しました。PNG保存や.mmd保存をご利用ください。');
    } catch (e) {
      showError(errorBox, e);
    }
  });

  downloadPngBtn.addEventListener('click', async () => {
    try {
      const scale = Math.max(PNG_SCALE.MIN, Math.min(PNG_SCALE.MAX, Number(scaleInput.value) || PNG_SCALE.DEFAULT));
      await downloadPng(preview, scale);
      setStatus(statusEl, `PNGを保存しました（倍率×${scale}）`);
    } catch (e) {
      showError(errorBox, e);
    }
  });

  shareUrlBtn.addEventListener('click', async () => {
    const code = editor.value.trim();
    const result = updateShareState(code);
    if (result.ok) {
      const ok = await copyText(location.href);
      setStatus(statusEl, ok ? `共有URLをコピーしました（方式：${result.method}）` : 'URLのコピーに失敗しました');
      return;
    }

    const encoded = encodeCode(code);
    const ok = await copyText(encoded);
    setStatus(
      statusEl,
      ok
        ? 'URL更新不可の環境です。代わりに「エンコード済みコード」をコピーしました。別環境で貼り付けてお使いください。'
        : '共有不可の環境です（クリップボード未許可）。.mmd保存をご利用ください。',
    );
  });

  selfTestBtn.addEventListener('click', () => {
    runSelfTest({ setStatus, statusEl, SAMPLES, encodeCode, decodeCode, isSandboxed });
  });
}
