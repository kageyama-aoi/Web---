
export function toSQL(rowsObj, headerLabels, NL){
  const cols = headerLabels;
  const colIds = cols.map((_,i)=>`col${String(i+1).padStart(2,"0")}`);
  const create = `CREATE TABLE sample (${colIds.map(c=>`${c} TEXT`).join(", ")});`;
  const values = rowsObj.map(o => `(${colIds.map((c,idx)=>`'${String(o[cols[idx]] ?? "").replace(/'/g,"''")}'`).join(", ")})`).join(`,${NL}`);
  const insert = `INSERT INTO sample (${colIds.join(", ")}) VALUES${NL}${values};`;
  return `${create}${NL}${insert}`;
}
