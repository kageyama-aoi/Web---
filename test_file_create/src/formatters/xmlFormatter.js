
export function toXML(rowsObj, headerLabels, NL){
  const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const heads = headerLabels;
  const body = rowsObj.map(o => "  <row>" + NL + heads.map(h=>`    <${h}>${esc(o[h] ?? "")}</${h}>`).join(NL) + NL + "  </row>").join(NL);
  return `<rows>${NL}${body}${NL}</rows>`;
}
