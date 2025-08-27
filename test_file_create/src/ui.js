

import { PRESETS } from './data/presets.js';

/* ------------------ UI ヘルパ ------------------ */
export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));

export function getCurrentPreset(){
  const el = $("#preset");
  // 要素が存在しない場合は、フォールバックとしてPRESETSの最初のキーを返す
  return el ? el.value : (Object.keys(PRESETS)[0] || null);
}
export function getPreset(){ return PRESETS[getCurrentPreset()]; }
export function getFormat(){ return $$('input[name="fmt"]').find(x=>x.checked)?.value || "CSV"; }
export function getDelimiter(){ return $$('input[name="delim"]').find(x=>x.checked)?.value || ","; }
export function getNewline(){
  const v = $$('input[name="nl"]').find(x=>x.checked)?.value || "LF";
  return v==="CRLF" ? "\r\n" : v==="CR" ? "\r" : "\n";
}
export function withHeader(){
  const el = $("#withHeader");
  return el ? el.checked : true; // 要素がなければデフォルトで true
}
export function getEncoding(){ return $$('input[name="enc"]').find(x=>x.checked)?.value || "UTF-8"; }
export function getRowCount() {
  const input = $("#rowCount");
  // rowCount input が存在しない場合も考慮し、デフォルト値を返す
  return input ? (parseInt(input.value, 10) || 10) : 10;
}

export function extFor(fmt){
  return ({CSV:"csv",TSV:"tsv",JSON:"json",YAML:"yaml",XML:"xml",Markdown:"md",TXT:"txt",HTML:"html",SQL:"sql",FIXED:"txt"})[fmt] || "txt";
}

export function applyPresetDefaults(){
  const p = getPreset();
  if (!p) return; // プリセット定義が見つからなければ何もしない

  // format
  $$('input[name="fmt"]').forEach(r => r.checked = (r.value === (p.default?.format || "CSV")));
  // delimiter
  $$('input[name="delim"]').forEach(r => r.checked = (r.value === (p.default?.delimiter || ",")));
  // header
  if ($("#withHeader")) $("#withHeader").checked = (p.default?.withHeader ?? true);
  // encoding
  $$('input[name="enc"]').forEach(r => r.checked = (r.value === (p.default?.encoding || "UTF-8")));
  // newline
  $$('input[name="nl"]').forEach(r => r.checked = (r.value === (p.default?.newline || "LF")));
  updateControlAvailability();
}

export function updateControlAvailability(){
  const fmt = getFormat();
  // 区切り/ヘッダは CSV/TSV/Markdown のみ有効（TSVはdelimiter=\t推奨）
  const delimOn = (fmt==="CSV" || fmt==="TSV");
  $$('input[name="delim"]').forEach(el => el.disabled = !delimOn);
  const withHeaderEl = $("#withHeader");
  if (withHeaderEl) withHeaderEl.disabled = !(fmt==="CSV" || fmt==="TSV" || fmt==="Markdown");
}

export function headerLabels(preset){
  if (preset && preset.fields) return preset.fields.map(f=>f.key);
  // フォールバック（未定義時）
  return [];
}

/**
 * データから編集可能なテーブルを生成し、コンテナに描画します。
 * @param {HTMLElement} container - テーブルを描画するコンテナ要素
 * @param {string[]} headers - テーブルのヘッダーラベル配列
 * @param {object[]} dataRows - 表示するデータのオブジェクト配列
 */
export function renderStructuredPreview(container, headers, dataRows) {
  if (!container) return;

  const table = document.createElement('table');
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  const tbody = table.createTBody();
  dataRows.forEach(dataRow => {
    const tr = tbody.insertRow();
    headers.forEach(header => {
      const td = tr.insertCell();
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'mono'; // 等幅フォントを適用
      input.value = dataRow[header] ?? '';
      td.appendChild(input);
    });
  });

  container.innerHTML = '';
  container.appendChild(table);

  // テーブル内の入力が変更されたら「編集を反映」ボタンを表示する
  table.addEventListener('input', () => {
    const applyBtn = $('#apply-structured-changes');
    if (applyBtn) applyBtn.style.display = 'inline-flex';
  });
}

/**
 * 構造化プレビューのテーブルから現在のデータを読み取ります。
 * @param {HTMLElement} container - テーブルが描画されているコンテナ要素
 * @param {string[]} headers - テーブルのヘッダーラベル配列
 * @returns {object[]} 読み取ったデータのオブジェクト配列
 */
export function readDataFromStructuredPreview(container, headers) {
  const rows = Array.from(container.querySelectorAll('tbody tr'));
  return rows.map(tr => {
    const newRow = {};
    const inputs = Array.from(tr.querySelectorAll('input'));
    headers.forEach((header, index) => {
      if (inputs[index]) newRow[header] = inputs[index].value;
    });
    return newRow;
  });
}
