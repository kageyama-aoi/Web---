
import { csvQuote } from '../../src/utils/stringUtils.js';

export function toCSVTSV(rowsObj, delimiter, withHeader, headerLabels){
  const heads = headerLabels;
  const lines = [];
  if (withHeader) lines.push(heads.map(h=>csvQuote(h, delimiter)).join(delimiter));
  for (const o of rowsObj){
    lines.push(heads.map(h=>csvQuote(o[h] ?? "", delimiter)).join(delimiter));
  }
  return lines.join("\n");
}

