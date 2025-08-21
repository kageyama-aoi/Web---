
export function newlineify(text, NL){ return text.replace(/\r\n|\r|\n/g, "\n").split("\n").join(NL); }
export function csvQuote(cell, delimiter){
  const s = String(cell ?? "");
  const must = s.includes('"') || s.includes("\n") || s.includes("\r") || s.includes(delimiter);
  const escaped = s.replace(/"/g,'""');
  return must ? `"${escaped}"` : escaped;
}
export function onlyDigits(s){ return String(s ?? "").replace(/\D/g,""); }
export function padLeftZero(val, len){ return String(val ?? "").replace(/\D/g,"").padStart(len,"0").slice(-len); }
export function padRightSpace(val, len){ const s = String(val ?? ""); return (s + " ".repeat(len)).slice(0,len); }
export function padLeftSpace(val, len){ const s = String(val ?? ""); return (" ".repeat(len) + s).slice(-len); }

