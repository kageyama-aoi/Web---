

import { PRESETS } from './data/presets.js';

/* ------------------ UI ヘルパ ------------------ */
export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));

export function getCurrentPreset(){ return $("#preset").value; }
export function getPreset(){ return PRESETS[getCurrentPreset()]; }
export function getFormat(){ return $$('input[name="fmt"]').find(x=>x.checked)?.value || "CSV"; }
export function getDelimiter(){ return $$('input[name="delim"]').find(x=>x.checked)?.value || ","; }
export function getNewline(){
  const v = $$('input[name="nl"]').find(x=>x.checked)?.value || "LF";
  return v==="CRLF" ? "\r\n" : v==="CR" ? "\r" : "\n";
}
export function withHeader(){ return $("#withHeader").checked; }
export function getEncoding(){ return $$('input[name="enc"]').find(x=>x.checked)?.value || "UTF-8"; }

export function extFor(fmt){
  return ({CSV:"csv",TSV:"tsv",JSON:"json",YAML:"yaml",XML:"xml",Markdown:"md",TXT:"txt",HTML:"html",SQL:"sql",FIXED:"txt"})[fmt] || "txt";
}

export function applyPresetDefaults(){
  const p = getPreset();
  // format
  $$('input[name="fmt"]').forEach(r => r.checked = (r.value === (p.default?.format || "CSV")));
  // delimiter
  $$('input[name="delim"]').forEach(r => r.checked = (r.value === (p.default?.delimiter || ",")));
  // header
  $("#withHeader").checked = (p.default?.withHeader ?? true);
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
  $("#withHeader").disabled = !(fmt==="CSV" || fmt==="TSV" || fmt==="Markdown");
}

export function headerLabels(){
  const p = getPreset();
  if (p && p.fields) return p.fields.map(f=>f.key);
  // フォールバック（未定義時）
  return [];
}
