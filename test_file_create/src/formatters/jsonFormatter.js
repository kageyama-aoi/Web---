
export function toJSON(rowsObj, NL){
  const jsonString = JSON.stringify(rowsObj, null, 2);
  // JSON.stringifyはLF固定なので、指定の改行コードに置換する
  if (NL !== "\n") return jsonString.replace(/\n/g, NL);
  return jsonString;
}
