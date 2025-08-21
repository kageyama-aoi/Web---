import { PRESETS } from './data/presets.js';
import { $, $$, getPreset, getFormat, getDelimiter, getNewline, withHeader, getEncoding, extFor, applyPresetDefaults, updateControlAvailability, headerLabels } from './ui.js';
import { generateEDI2000Fixed, validateEDI } from './formatters/ediFormatter.js';
import { toCSVTSV } from './formatters/csvFormatter.js';
import { toJSON } from './formatters/jsonFormatter.js';
import { toYAML } from './formatters/yamlFormatter.js';
import { toXML } from './formatters/xmlFormatter.js';
import { toMarkdown } from './formatters/markdownFormatter.js';
import { toTXT } from './formatters/txtFormatter.js';
import { toHTML } from './formatters/htmlFormatter.js';
import { toSQL } from './formatters/sqlFormatter.js';
import { toFIXED_generic } from './formatters/fixedFormatter.js';

/* ------------------ データ取得（行） ------------------ */
function getRowsAsObjects(){
  const p = getPreset();
  if (p.id==="2000_1_1"){
    // EDI は rowsObj をそのまま返す（レコード区分等はCSV用に付与）
    return p.rowsObj.map(o => ({
      "レコード区分":"2",
      "データ区分":"00",
      ...o,
      "空白":"" // CSV用の末尾空白（固定長のときは専用ロジック）
    }));
  }
  // 通常プリセット（配列→オブジェクト化）
  if (Array.isArray(p.rows)){
    const heads = headerLabels();
    return p.rows.map(arr => Object.fromEntries(heads.map((k,i)=>[k, arr[i] ?? ""])));
  }
  return [];
}

const formatters = {
  CSV: (rowsObj, p, NL) => {
    const delim = getDelimiter();
    return toCSVTSV(rowsObj, delim, withHeader(), headerLabels(), NL);
  },
  TSV: (rowsObj, p, NL) => {
    return toCSVTSV(rowsObj, '\t', withHeader(), headerLabels(), NL);
  },
  JSON: (rowsObj, p, NL) => toJSON(rowsObj, NL),
  YAML: (rowsObj, p, NL) => toYAML(rowsObj, NL),
  XML: (rowsObj, p, NL) => toXML(rowsObj, headerLabels(), NL),
  Markdown: (rowsObj, p, NL) => toMarkdown(rowsObj, headerLabels(), NL),
  TXT: (rowsObj, p, NL) => toTXT(rowsObj, NL),
  HTML: (rowsObj, p, NL) => toHTML(rowsObj, headerLabels(), NL),
  SQL: (rowsObj, p, NL) => toSQL(rowsObj, headerLabels(), NL),
  FIXED: (rowsObj, p, NL) => {
    if (p.id === '2000_1_1') {
      // generateEDI2000Fixed already takes NL
      return generateEDI2000Fixed(rowsObj, NL);
    }
    return toFIXED_generic(rowsObj, getPreset, NL);
  },
};

function generate() {
  const p = getPreset();
  const fmt = getFormat();
  const NL = getNewline();
  const rowsObj = getRowsAsObjects();
  let text = '', ext = extFor(fmt), warn = [];

  const formatter = formatters[fmt];
  if (formatter) {
    text = formatter(rowsObj, p, NL);
  }

  if (fmt === 'FIXED' && p.id === '2000_1_1') {
    warn = validateEDI(rowsObj);
  }

  updateUI(text, p, ext, warn);

  return { text, ext };
}

function updateUI(text, p, ext, warn) {
  // 画面反映
  $('#preview').value = text;
  $('#fileName').textContent = `sample_${p.id}.${ext}`;

  const encoding = getEncoding();
  let blob;
  if (encoding === 'SJIS') {
    if (window.encoding) {
      const sjisArray = window.encoding.convert(text, { to: 'SJIS', from: 'UNICODE' });
      blob = new Blob([new Uint8Array(sjisArray)]);
    } else {
      console.warn('encoding.js is not loaded. File size calculation for SJIS may be incorrect.');
      blob = new Blob([text]); // Fallback to UTF-8 size
    }
  } else {
    blob = new Blob([text]);
  }
  $('#fileSize').textContent = `${blob.size.toLocaleString()} bytes`;
  $('#lineCount').textContent = (text.match(/\r\n|\r|\n/g)?.length ?? 0) + 1;

  // メタチェック（先頭行を schema で見る：固定長系のみ）
  renderChecks(getRowsAsObjects(), p, getFormat());

  // EDI 警告
  if (warn.length) {
    $('#panelWarn').style.display = '';
    $('#warnArea').textContent = warn.join('\n');
  } else {
    $('#panelWarn').style.display = 'none';
    $('#warnArea').textContent = '';
  }
}

function renderChecks(rowsObj, p, fmt){
  const el = $("#checksArea");
  const schema = p.fields || [];
  let html = "";
  if (!schema.length){ el.innerHTML = "<div class='small muted'>フィールド定義なし</div>"; return; }

  const row = rowsObj[0] || {};
  if (fmt === "FIXED"){
    html += "<table><thead><tr><th>#</th><th>項目</th><th>定義桁</th><th>実長</th><th>判定</th></tr></thead><tbody>";
    schema.forEach((f, i) => {
      const v = String(row[f.key] ?? ""); const actual = v.length;
      const def = f.len || "";
      let cls = "ok", lab = "OK";
      if (def && actual > def){ cls="warn"; lab="超過"; }
      html += `<tr><td>${i+1}</td><td>${f.key}</td><td class='mono'>${def}</td><td class='${actual}'>${cls}'>${lab}</td></tr>`;
    });
    html += "</tbody></table>";
  } else {
    html = "<div class='small muted'>固定長以外は簡易チェックを省略</div>";
  }
  el.innerHTML = html;
}

/* ------------------ ダウンロード ------------------ */
function doDownload(){
  const { text, ext } = generate();
  const name = $("#fileName").textContent || `sample.${ext}`;
  const encoding = getEncoding();
  let blob;
  let mimeType = `text/plain;charset=${encoding.toLowerCase()}`;

  if (encoding === 'SJIS') {
    if (window.encoding) {
      const sjisArray = window.encoding.convert(text, { to: 'SJIS', from: 'UNICODE' });
      mimeType = 'text/plain;charset=shift_jis';
      blob = new Blob([new Uint8Array(sjisArray)], { type: mimeType });
    } else {
      alert('Shift-JISへの変換ライブラリが読み込めませんでした。オフライン環境でないか確認してください。\nファイルをUTF-8でダウンロードします。');
      mimeType = 'text/plain;charset=utf-8';
      blob = new Blob([text], { type: mimeType });
    }
  } else {
    // UTF-8
    blob = new Blob([text], { type: mimeType });
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 100);
}

/* ------------------ イベント ------------------ */
function initEventListeners() {
  $("#preset").addEventListener("change", ()=>{
    applyPresetDefaults(); 
    generate();
  });
  $$('input[name="fmt"]').forEach(r=>r.addEventListener("change", ()=>{
    updateControlAvailability(); 
    generate();
  }));
  $$('input[name="delim"]').forEach(r=>r.addEventListener("change", ()=>{
    generate();
  }));
  $("#withHeader").addEventListener("change", ()=>{
    generate();
  });
    $$('input[name="nl"]').forEach(r=>r.addEventListener("change", ()=>{
    generate();
  }));
  $$('input[name="enc"]').forEach(r=>r.addEventListener("change", ()=>{
    generate();
  }));
  $("#btnPreview").addEventListener("click", ()=>{
    generate();
  });
  $("#btnDownload").addEventListener("click", ()=>{
    doDownload();
  });
}

function checkExternalLibraries() {
  // encoding.js が読み込めていない場合、Shift-JISの選択肢を無効化する
  if (!window.encoding) {
    const sjisRadio = $('#enc_sjis');
    const sjisLabel = $('#label_enc_sjis');
    if (sjisRadio && sjisLabel) {
      sjisRadio.disabled = true;
      sjisLabel.style.opacity = '0.5';
      sjisLabel.style.cursor = 'not-allowed';
      sjisLabel.title = 'Shift-JIS変換ライブラリが読み込めませんでした。オフライン環境でないか確認してください。';
    }
  }
}

// 初期化
applyPresetDefaults();
generate();
initEventListeners();
checkExternalLibraries();