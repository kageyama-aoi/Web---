

import { padLeftZero, padRightSpace } from '../../src/utils/stringUtils.js';

export function toFIXED_generic(rowsObj, getPreset){
  // 現在選択プリセットの fields を使ってゼロ/スペース詰め（超過は切り捨てず丸め）
  const p = getPreset(); const schema = p.fields || [];
  const padBy = (val, f) => {
    if (!f.len) return String(val ?? "");
    if (f.type === "number") return padLeftZero(val, f.len);
    return padRightSpace(val, f.len);
  };
  return rowsObj.map(o => schema.map(f => padBy(o[f.key], f)).join("")).join("\n");
}

