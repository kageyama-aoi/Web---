import { $, getPreset, headerLabels } from './ui.js';

function getRowCount() {
  const input = $('#rowCount');
  if (!input) return 1;
  const count = parseInt(input.value, 10);
  return isNaN(count) || count < 1 ? 1 : count;
}

export function getRowsAsObjects(){
  const p = getPreset();
  const rowCount = getRowCount();
  let baseRows = [];

  if (p.id === "2000_1_1"){
    // EDI は rowsObj をそのまま返す（レコード区分等はCSV用に付与）
    baseRows = p.rowsObj.map(o => ({
      "レコード区分":"2",
      "データ区分":"00",
      ...o,
      "空白":"" // CSV用の末尾空白（固定長のときは専用ロジック）
    }));
  } else if (Array.isArray(p.rows)){
    // 通常プリセット（配列→オブジェクト化）
    const heads = headerLabels();
    baseRows = p.rows.map(arr => Object.fromEntries(heads.map((k,i)=>[k, arr[i] ?? ""])));
  }

  if (baseRows.length === 0) return [];

  const generatedRows = [];
  for (let i = 0; i < rowCount; i++) {
    generatedRows.push(baseRows[i % baseRows.length]);
  }
  return generatedRows;
}