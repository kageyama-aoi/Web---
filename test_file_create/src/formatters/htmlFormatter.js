
export function toHTML(rowsObj, headerLabels, NL){
  const heads = headerLabels;
  const th = heads.map(h=>`<th>${h}</th>`).join("");
  const trs = rowsObj.map(o=>`<tr>${heads.map(h=>`<td>${String(o[h] ?? "")}</td>`).join("")}</tr>`).join(NL);
  return `<!doctype html><html lang="ja"><meta charset="utf-8"><title>sample</title>${NL}  <style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:4px 8px}</style>${NL}  <table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}
