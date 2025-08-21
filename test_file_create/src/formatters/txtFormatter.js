
export function toTXT(rowsObj){
  return rowsObj.map((o,i)=>`- ${i+1}. ${Object.values(o).join(" ")}`).join("\n");
}
