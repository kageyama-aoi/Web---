
export function toTXT(rowsObj, NL){
  return rowsObj.map((o,i)=>`- ${i+1}. ${Object.values(o).join(" ")}`).join(NL);
}
