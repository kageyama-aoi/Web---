const PRESETS = {
  "1600_19_1": {
    id: "1600_19_1", name: "講師謝礼追加",
    default: { format: "CSV", delimiter: ",", withHeader: true },
    // 汎用20項目のサンプル（簡略）
    fields: [
      { key:"講師ID",type:"text",len:36 },{ key:"ID番号",type:"text",len:32 },
      { key:"講師名",type:"text",len:40 },{ key:"支払方法",type:"number",len:1 },
      { key:"コースID",type:"text",len:36 },{ key:"ジャンル",type:"text",len:5 },
      { key:"店舗ID",type:"text",len:36 },{ key:"コース名",type:"text",len:50 },
      { key:"コース料金",type:"number" },{ key:"クラスID",type:"text",len:36 },
      { key:"クラス名",type:"text",len:50 },{ key:"計上日",type:"date8",len:8 },
      { key:"対象月",type:"date6",len:6 },{ key:"謝礼項目",type:"number",len:5 },
      { key:"報酬率",type:"number" },{ key:"報酬額",type:"number" },
      { key:"税額",type:"number" },{ key:"支払額",type:"number",len:10 },
      { key:"受講数",type:"number",len:5 },{ key:"備考",type:"text" }
    ],
    rows: [[
      "00005","50005","山田 一郎","1","ZE17","1","001","ピアノ中級グループ",
      "10000","0115524414","ピアノ月曜14時","20220805","202207","1","43",
      "10000","1021","3860","5","講師謝礼一括追加"
    ]]
  },

  "2000_1_1": {
    id: "2000_1_1", name: "EDI新規会員データ取込",
    default: { format: "FIXED", delimiter: "\t", withHeader: true },
    // このプリセットのスキーマ（CSV/JSON等でも使うヘッダ名）
    fields: [
      { key:"レコード区分", type:"number", len:1 },
      { key:"データ区分",   type:"number", len:2 },
      { key:"審査フラグ",   type:"text",   len:1 },
      { key:"カード番号",   type:"text",   len:16 },
      { key:"カード有効期限(YYMM)", type:"number", len:4 },
      { key:"13桁会員番号", type:"text",   len:13 },
      { key:"カナ氏名",     type:"text",   len:18 },
      { key:"性別",         type:"number", len:1 },
      { key:"生年月日(YYYYMMDD)", type:"number", len:8 },
      { key:"入会申込日(YYYYMMDD)", type:"number", len:8 },
      { key:"受付店舗コード", type:"text", len:3 },
      { key:"空白",         type:"text",   len:25 }
    ],
    // EDI 固定長は専用ロジックで出す。CSV等ではこの順の見出しで出力
    rowsObj: [
      { 審査フラグ:"0", カード番号:"4111111111111111", "カード有効期限(YYMM)":"2607", "13桁会員番号":"1234567890123", カナ氏名:"ｶｹﾞﾔﾏ ｱｵｲ", 性別:"2", "生年月日(YYYYMMDD)":"19901123", "入会申込日(YYYYMMDD)":"20250819", 受付店舗コード:"007" },
      { 審査フラグ:"1", カード番号:"5500000000000004", "カード有効期限(YYMM)":"2703", "13桁会員番号":"9876543210987", カナ氏名:"ﾔﾏﾀﾞ ﾀﾛｳ", 性別:"1", "生年月日(YYYYMMDD)":"19800123", "入会申込日(YYYYMMDD)":"20250820", 受付店舗コード:"001" },
      { 審査フラグ:"0", カード番号:"340000000000009",  "カード有効期限(YYMM)":"2812", "13桁会員番号":"1112223334445", カナ氏名:"ｽｽﾞｷ ﾊﾅｺ", 性別:"2", "生年月日(YYYYMMDD)":"19940228", "入会申込日(YYYYMMDD)":"20250818", 受付店舗コード:"010" }
    ]
  },

  "4000_3_1": {
    id:"4000_3_1", name:"SMBC買取状態読込（ダミー）",
    default:{ format:"CSV", delimiter:",", withHeader:true },
    fields:[
      { key:"取引ID",type:"text",len:32 },
      { key:"状態",type:"text",len:8 },
      { key:"更新日",type:"date8",len:8 }
    ],
    rows:[["T123","OK","20250801"]]
  }
};

export { PRESETS };