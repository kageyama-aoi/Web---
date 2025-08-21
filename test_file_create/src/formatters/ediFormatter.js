
import { onlyDigits, padLeftZero, padRightSpace, padLeftSpace } from '../../src/utils/stringUtils.js';

function ediHeader(){ return "1" + " ".repeat(99); }
function ediEnd(){ return "9" + " ".repeat(99); }
function storeCode3(value){
  // プリセットの値をそのまま使い、3桁になるよう左をスペースで埋める
  return padLeftSpace(value, 3);
}
function ediDataRow(obj){
  // obj には 審査フラグ/カード番号/カード有効期限(YYMM)/13桁会員番号/カナ氏名/性別/生年月日(YYYYMMDD)/入会申込日(YYYYMMDD)/受付店舗コード
  let rec = "";
  rec += "2"; // レコード区分
  rec += "00"; // データ区分
  rec += padRightSpace(obj["審査フラグ"] ?? "0", 1);
  const card = onlyDigits(obj["カード番号"]).slice(0,16);
  rec += padRightSpace(card, 16);
  rec += padLeftZero(obj["カード有効期限(YYMM)"] ?? "0000", 4);
  const mem = onlyDigits(obj["13桁会員番号"] ?? obj["会員番号13"]).slice(0,13);
  rec += padRightSpace(mem, 13);
  rec += padRightSpace(obj["カナ氏名"] ?? "", 18);
  rec += padLeftZero(obj["性別"] ?? "1", 1);
  rec += padLeftZero(obj["生年月日(YYYYMMDD)"] ?? "20000101", 8);
  rec += padLeftZero(obj["入会申込日(YYYYMMDD)"] ?? "20000101", 8);
  rec += storeCode3(obj["受付店舗コード"] ?? "");
  rec += " ".repeat(25);
  if (rec.length !== 100) console.warn("EDI data len", rec.length, obj);
  return rec;
}
function ediTrailer(count){
  let rec = "";
  rec += "8";
  rec += padLeftZero(count, 9);
  rec += " ".repeat(90);
  if (rec.length !== 100) console.warn("EDI trailer len", rec.length);
  return rec;
}
export function generateEDI2000Fixed(rowsObj, NL){
  const out = [ediHeader()];
  rowsObj.forEach(o => out.push(ediDataRow(o)));
  out.push(ediTrailer(rowsObj.length));
  out.push(ediEnd());
  return out.join(NL);
}
export function validateEDI(rowsObj){
  const warn = [];
  const re4=/^[0-9]{4}$/; const re8=/^[0-9]{8}$/; const re13=/^[0-9]{13}$/; const re16=/^[0-9]{16}$/;
  const sex=/^[12]$/;
  rowsObj.forEach((r,i)=>{
    const p = i+1;
    if(!re4.test(String(r["カード有効期限(YYMM)"]||""))) warn.push(`[${p}] 有効期限: YYMM 4桁`);
    if(!re13.test(onlyDigits(r["13桁会員番号"]||"")))   warn.push(`[${p}] 会員番号: 13桁数値`);
    if(!re16.test(onlyDigits(r["カード番号"]||"")))     warn.push(`[${p}] カード番号: 16桁数値`);
    if(!sex.test(String(r["性別"]||"")))                 warn.push(`[${p}] 性別: 1 or 2`);
    if(!re8.test(String(r["生年月日(YYYYMMDD)"]||"")))  warn.push(`[${p}] 生年月日: YYYYMMDD`);
    if(!re8.test(String(r["入会申込日(YYYYMMDD)"]||"")))warn.push(`[${p}] 申込日: YYYYMMDD`);
  });
  return warn;
}
