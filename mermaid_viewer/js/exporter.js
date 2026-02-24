import { MIME, SVG_NS, SVG_XLINK_NS } from './constants.js';

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  }
}

export function getSvgXml(previewEl) {
  const svg = previewEl.querySelector('svg');
  if (!svg) throw new Error('SVGが見つかりません');
  const clone = svg.cloneNode(true);
  // 幅/高さを固定
  if (!clone.getAttribute('width') || !clone.getAttribute('height')) {
    const vb = clone.getAttribute('viewBox');
    if (vb) { const [, , w, h] = vb.split(/\s+/).map(Number); clone.setAttribute('width', w); clone.setAttribute('height', h); }
  }
  // 名前空間の明示
  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', SVG_NS);
  if (!clone.getAttribute('xmlns:xlink')) clone.setAttribute('xmlns:xlink', SVG_XLINK_NS);
  const xml = new XMLSerializer().serializeToString(clone);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}

export function saveBlob(text, name, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  try { a.click(); }
  finally { setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); }
}

export async function copySvg(previewEl) {
  const svgText = getSvgXml(previewEl);
  return copyText(svgText);
}

/** 3段階フォールバック: Blob → 新規タブ → クリップボード */
export async function downloadSvg(previewEl) {
  const svgText = getSvgXml(previewEl); // SVGが無ければここで throw
  // まずはBlobダウンロード（推奨）
  try {
    saveBlob(svgText, 'diagram.svg', MIME.SVG);
    return { method: 'blob' };
  } catch (e) { console.warn('Blob download failed, trying data URL', e); }
  // フォールバック1：新規タブで data:URL を開く（Safari等）
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
  const win = window.open(dataUrl, '_blank');
  if (win) return { method: 'tab' };
  // フォールバック2：クリップボードにSVGテキストをコピー
  const ok = await copyText(svgText);
  return { method: ok ? 'clipboard' : 'failed' };
}

export function svgToPng(svgText, scale) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
    img.onload = () => {
      const w = Math.ceil(img.width * scale);
      const h = Math.ceil(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = encoded;
  });
}

export async function downloadPng(previewEl, scale) {
  const svgText = getSvgXml(previewEl);
  const dataUrl = await svgToPng(svgText, scale);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'diagram.png';
  a.click();
}
