
export function toYAML(rowsObj){
  // 超簡易実装（値に改行やコロンが含まれる場合は適宜拡張）
  const esc = v => {
    const s = String(v ?? "");
    return (/[:#\-]|^\s|\s$|\n/.test(s)) ? JSON.stringify(s) : s;
  };
  return rowsObj.map(obj => "- " + Object.entries(obj).map(([k,v])=>`${k}: ${esc(v)}`).join("\n  ")).join("\n");
}
