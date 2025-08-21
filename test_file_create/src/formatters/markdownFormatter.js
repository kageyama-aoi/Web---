export function toMarkdown(rowsObj, headerLabels, NL){
  const heads = headerLabels;
  const header = `| ${heads.join(" | ")} |`;
  const sep = `| ${heads.map(()=>":---").join(" | ")} |`;
  const rows = rowsObj.map(o => `| ${heads.map(h=>String(o[h] ?? "").replace(/\|/g,"\\|")).join(" | ")} |`);
  return [header, sep, ...rows].join(NL);
}
