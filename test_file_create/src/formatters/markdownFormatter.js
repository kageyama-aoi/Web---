export function toMarkdown(rowsObj, headerLabels, NL, withHeader = true){
  const heads = headerLabels;
  const rows = rowsObj.map(o => `| ${heads.map(h=>String(o[h] ?? "").replace(/\|/g,"\\|")).join(" | ")} |`);

  if (withHeader) {
    const headerLine = `| ${heads.join(" | ")} |`;
    const separatorLine = `| ${heads.map(()=>":---").join(" | ")} |`;
    return [headerLine, separatorLine, ...rows].join(NL);
  } else {
    return rows.join(NL);
  }
}
