
export function toXML(rowsObj, headerLabels){
  const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const heads = headerLabels;
  const body = rowsObj.map(o => "  <row>\n" + heads.map(h=>`    <${h}>${esc(o[h] ?? "")}</${h}>`).join("\n") + "\n  </row>").join("\n");
  return `<rows>\n${body}\n</rows>`;
}
