import { PRESETS } from './data/presets.js';
import { $, $$, getPreset, getFormat, getDelimiter, getNewline, withHeader, getEncoding, extFor, applyPresetDefaults, updateControlAvailability, headerLabels, getRowCount } from './ui.js';
import { getRowsAsObjects as generateData } from './dataGenerator.js';
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

let lastGeneratedResult = {}; // Module-level state for the last generation output

const formatters = {
  CSV: (rowsAsObjects, { preset, newline, delimiter, withHeader }) => {
    return toCSVTSV(rowsAsObjects, delimiter, withHeader, headerLabels(preset), newline);
  },
  TSV: (rowsAsObjects, { preset, newline, withHeader }) => {
    return toCSVTSV(rowsAsObjects, '\t', withHeader, headerLabels(preset), newline);
  },
  JSON: (rowsAsObjects, { newline }) => toJSON(rowsAsObjects, newline),
  YAML: (rowsAsObjects, { newline }) => toYAML(rowsAsObjects, newline),
  XML: (rowsAsObjects, { preset, newline }) => toXML(rowsAsObjects, headerLabels(preset), newline),
  Markdown: (rowsAsObjects, { preset, newline, withHeader }) => toMarkdown(rowsAsObjects, headerLabels(preset), newline, withHeader),
  TXT: (rowsAsObjects, { newline }) => toTXT(rowsAsObjects, newline),
  HTML: (rowsAsObjects, { preset, newline }) => toHTML(rowsAsObjects, headerLabels(preset), newline),
  SQL: (rowsAsObjects, { preset, newline }) => toSQL(rowsAsObjects, headerLabels(preset), newline),
  FIXED: (rowsAsObjects, { preset, newline }) => {
    if (preset.id === '2000_1_1') {
      return generateEDI2000Fixed(rowsAsObjects, newline);
    }
    // toFIXED_genericはプリセットを返す関数を期待するため、ラップして渡す
    return toFIXED_generic(rowsAsObjects, () => preset, newline);
  },
};

/**
 * プリセット定義に基づき、指定された行数のデータオブジェクト配列を準備します。
 * `rowsObj` (オブジェクト配列) と `rows` (値の配列) の両方の形式に対応します。
 * @param {object} preset - プリセットオブジェクト
 * @param {number} rowCount - 生成する行数
 * @returns {object[]} データオブジェクトの配列
 */
function prepareData(preset, rowCount) {
  let sampleData = [];
  // プリセットのrowsObjは参照なので、ディープコピーして元の定義を汚染しないようにする
  if (preset.rowsObj) {
    sampleData = JSON.parse(JSON.stringify(preset.rowsObj));
  } else if (preset.rows && preset.fields) {
    // データが値の配列として定義されている場合、ヘッダー情報を使ってオブジェクトに変換
    const keys = preset.fields.map(f => f.key);
    sampleData = preset.rows.map(rowArray => {
      const obj = {};
      keys.forEach((key, index) => {
        obj[key] = rowArray[index] ?? '';
      });
      return obj;
    });
  }

  // EDIプリセット用の動的フィールドをここで設定する
  // これにより、CSV/JSONなど他のフォーマットでもこれらの値が反映される
  if (preset.id === '2000_1_1') {
    sampleData.forEach(row => {
      row["レコード区分"] = "2";
      row["データ区分"] = "00";
    });
  }

  if (sampleData.length === 0) return [];

  // サンプルデータを循環させて、指定された行数のデータを生成
  const results = [];
  for (let i = 0; i < rowCount; i++) {
    results.push({ ...sampleData[i % sampleData.length] });
  }
  return results;
}

/**
 * 設定に基づきデータを生成・整形する純粋な関数
 * @param {object} config - データ生成に必要な設定オブジェクト
 * @returns {object} 生成結果（テキスト、拡張子、警告、データオブジェクト等）
 */
function generate(config) {
  const { preset, format, rowCount } = config;
  const rowsAsObjects = prepareData(preset, rowCount);

  let text = '', ext = extFor(format), warnings = [];

  const formatter = formatters[format];
  if (formatter) {
    text = formatter(rowsAsObjects, config);
  }

  if (format === 'FIXED' && preset.id === '2000_1_1') {
    warnings = validateEDI(rowsAsObjects);
  }

  return { text, ext, warnings, rowsAsObjects, preset };
}

function populateRowSelector(rowsAsObjects, includeHeader) {
  const selector = $('#rowSelector');
  selector.innerHTML = ''; // Clear previous options

  if (includeHeader) {
    const option = document.createElement('option');
    option.value = '-1';
    option.textContent = 'ヘッダー';
    selector.appendChild(option);
  }

  rowsAsObjects.forEach((row, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `データ行 ${i + 1}`;
    selector.appendChild(option);
  });

  if (selector.options.length > 0) {
    selector.value = (rowsAsObjects.length > 0) ? '0' : '-1';
  }
}

function renderStructuredPreview(rowIndex, rowsAsObjects, preset) {
  const container = $('#structuredPreview');
  container.innerHTML = ''; // Clear previous content

  const headers = headerLabels(preset);

  let dataToShow = {};
  
  if (rowIndex === -1) { // Header view
    if (headers.length === 0) {
      container.innerHTML = "<div class='small muted'>ヘッダー定義がありません。</div>";
      return;
    }
    headers.forEach(h => { dataToShow[h] = ''; });
  } else if (rowsAsObjects && rowsAsObjects[rowIndex]) { // Data row view
    dataToShow = rowsAsObjects[rowIndex];
  } else {
    container.innerHTML = "<div class='small muted'>表示するデータがありません。</div>";
    return;
  }

  const table = document.createElement('table');
  table.className = 'structured-preview-table'; // CSSクラスでスタイルを管理
  const tbody = document.createElement('tbody');

  headers.forEach(header => {
    const tr = document.createElement('tr');

    const th = document.createElement('th');
    th.textContent = header;
    tr.appendChild(th);

    const td = document.createElement('td');
    td.textContent = dataToShow[header] ?? '';
    // データ行の場合のみ編集可能にし、どのフィールドかを示す属性を付与
    if (rowIndex !== -1) {
      td.contentEditable = 'true';
      td.dataset.fieldKey = header;
    }
    tr.appendChild(td);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  // 新しい行を描画したので、「編集を反映」ボタンを隠す
  const reflectButton = $('#btnReflect');
  if (reflectButton) {
    reflectButton.style.display = 'none';
  }
}

function updateUI({ text, preset, ext, warnings, rowsAsObjects }, isFullUpdate = true) {
  $('#preview').value = text;
  const p = preset; // 短縮用
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

  // 構造化プレビューの更新
  if (isFullUpdate) {
    populateRowSelector(rowsAsObjects, withHeader());
    const initialRowIndex = (rowsAsObjects.length > 0) ? 0 : -1;
    $('#rowSelector').value = initialRowIndex;
    renderStructuredPreview(initialRowIndex, rowsAsObjects, p);
  }

  // メタチェック（先頭行を schema で見る：固定長系のみ）
  renderChecks(p, getFormat(), rowsAsObjects);

  // EDI 警告
  if (warnings.length) {
    $('#panelWarn').style.display = '';
    $('#warnArea').textContent = warnings.join('\n');
  } else {
    $('#panelWarn').style.display = 'none';
    $('#warnArea').textContent = '';
  }
}

function renderChecks(preset, format, rowsAsObjects){
  const el = $("#checksArea");
  const schema = preset.fields || [];
  let html = "";
  if (!schema.length){ el.innerHTML = "<div class='small muted'>フィールド定義なし</div>"; return; }

  const row = rowsAsObjects[0] || {};
  if (format === "FIXED"){
    html += "<table><thead><tr><th>#</th><th>項目</th><th>定義桁</th><th>実長</th><th>判定</th></tr></thead><tbody>";
    schema.forEach((f, i) => {
      const v = String(row[f.key] ?? ""); const actual = v.length;
      const def = f.len || "";
      let cls = "ok", lab = "OK";
      if (def && actual > def) { cls = "warn"; lab = "超過"; } // HTML生成のバグを修正
      html += `<tr><td>${i+1}</td><td>${f.key}</td><td class='mono'>${def}</td><td class='mono'>${actual}</td><td class='${cls}'>${lab}</td></tr>`;
    });
    html += "</tbody></table>";
  } else {
    html = "<div class='small muted'>固定長以外は簡易チェックを省略</div>";
  }
  el.innerHTML = html;
}

/* ------------------ ダウンロード ------------------ */
function doDownload() {
  const { text, ext } = lastGeneratedResult; // 生成済みの結果を利用
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

/**
 * 構造化プレビューでの編集を反映し、メインのプレビューを再生成する
 */
function reformatAndUpatePreview() {
  const { rowsAsObjects, preset } = lastGeneratedResult;

  // 現在のUI設定を再取得
  const config = {
    preset: preset,
    format: getFormat(),
    delimiter: getDelimiter(),
    newline: getNewline(),
    withHeader: withHeader(),
    headers: headerLabels(preset), // formatterが必要とするheadersプロパティ
  };

  const formatter = formatters[config.format];
  if (!formatter) return;

  const text = formatter(rowsAsObjects, config);

  // lastGeneratedResult の状態を更新
  lastGeneratedResult.text = text;

  // UIの一部（構造化プレビュー以外）を更新
  updateUI({ ...lastGeneratedResult, text: text }, false);
}

function handleStructuredPreviewEdit(event) {
  const td = event.target.closest('td[contenteditable="true"]');
  if (!td) return;

  const rowIndex = parseInt($('#rowSelector').value, 10);
  const fieldKey = td.dataset.fieldKey;

  if (rowIndex >= 0 && fieldKey && lastGeneratedResult.rowsAsObjects[rowIndex]) {
    lastGeneratedResult.rowsAsObjects[rowIndex][fieldKey] = td.textContent;
    // プレビューの即時更新の代わりに、「編集を反映」ボタンを表示する
    const reflectButton = $('#btnReflect');
    if (reflectButton) {
      reflectButton.style.display = 'inline-block';
    }
  }
}

/**
 * UIイベントを起点に、データ生成フロー全体を管理するコントローラー関数
 */
function handleGenerationRequest() {
  // 1. UIから全設定値を取得
  const config = {
    preset: getPreset(),
    format: getFormat(),
    delimiter: getDelimiter(),
    newline: getNewline(),
    withHeader: withHeader(),
    encoding: getEncoding(),
    rowCount: getRowCount(),
  };

  // 2. 純粋化されたコアロジックを呼び出し
  const result = generate(config);

  // 3. 結果を後続処理（ダウンロード等）のために保持
  lastGeneratedResult = result;

  // 4. 結果をUIに反映
  updateUI(result, true);
}

/* ------------------ イベント ------------------ */
function initEventListeners() {
  $("#preset").addEventListener("change", () => {
    applyPresetDefaults();
    handleGenerationRequest();
  });
  $$('input[name="fmt"]').forEach(r => r.addEventListener("change", () => {
    updateControlAvailability();
    handleGenerationRequest();
  }));
  // 関連する入力要素のイベントを一括で設定
  $$('input[name="delim"], #withHeader, input[name="nl"], input[name="enc"], #rowCount').forEach(el => {
    if (!el) return; // #rowCount などが存在しない場合に備える
    const eventType = el.id === 'rowCount' ? 'input' : 'change';
    el.addEventListener(eventType, handleGenerationRequest);
  });

  const rowSelector = $("#rowSelector");
  if (rowSelector) {
    rowSelector.addEventListener("change", (e) => {
      renderStructuredPreview(parseInt(e.target.value, 10), lastGeneratedResult.rowsAsObjects, lastGeneratedResult.preset);
    });

    // 「編集を反映」ボタンを動的に作成して追加
    const reflectButton = document.createElement('button');
    reflectButton.id = 'btnReflect';
    reflectButton.textContent = '編集を反映';
    reflectButton.style.display = 'none';
    reflectButton.style.marginLeft = '8px';
    rowSelector.parentElement.appendChild(reflectButton);

    reflectButton.addEventListener('click', reformatAndUpatePreview);
  }

  // 構造化プレビューの編集イベントをコンテナで捕捉 (イベントデリゲーション)
  const structuredPreviewContainer = $("#structuredPreview");
  if (structuredPreviewContainer) {
    structuredPreviewContainer.addEventListener('input', handleStructuredPreviewEdit);
  }
  $("#btnPreview").addEventListener("click", handleGenerationRequest);
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

/**
 * プリセット選択UIのレイアウトを調整します。
 * プリセットのラベル等を含む親要素とプルダウンを縦に配置することで、
 * プルダウンの選択肢リストが他の要素に隠されるのを防ぎます。
 */
function adjustPresetLayout() {
  const presetElement = $('#preset');
  if (presetElement && presetElement.parentElement) {
    const container = presetElement.parentElement;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
  }
}

// 初期化
applyPresetDefaults();
handleGenerationRequest(); // 初期表示
initEventListeners();
checkExternalLibraries();
adjustPresetLayout();