export const DEFAULT_CODE = `%% サンプル：フローチャート\nflowchart TD\n  A([開始]) --> B{承認が必要?}\n  B -- はい --> C[承認依頼]\n  B -- いいえ --> D[実行]\n  C --> E[承認済み]\n  E --> D\n  D --> F([完了])\n`;

export const SAMPLES = {
  flow: DEFAULT_CODE,
  seq: `sequenceDiagram\n  actor User\n  participant FE as Frontend\n  participant API\n  participant DB\n  User->>FE: フォーム送信\n  FE->>API: POST /items\n  API->>DB: INSERT\n  DB-->>API: OK\n  API-->>FE: 201 Created\n  FE-->>User: 完了表示\n`,
  git: `gitGraph\n  commit id: "init"\n  branch feature/login\n  checkout feature/login\n  commit id: "feat: login"\n  checkout main\n  commit id: "chore: deps"\n  merge feature/login\n  commit tag: "v1.1.0"\n`,
  state: `stateDiagram-v2\n  [*] --> Draft\n  Draft --> Review : 提出\n  Review --> Approved : 承認\n  Review --> Rework : 差戻し\n  Rework --> Review\n  Approved --> Released\n  Released --> [*]\n`,
  er: `erDiagram\n  ACCOUNT ||--o{ PERSON : has\n  PERSON  ||--o{ SHAREI_DETAIL : submits\n  ACCOUNT {\n    int account_id PK\n    string idnumber\n    string name\n  }\n  PERSON {\n    int person_id PK\n    int account_id FK\n    string last_name\n    string first_name\n  }\n  SHAREI_DETAIL {\n    int id PK\n    int person_id FK\n    date keijou_month\n    string sharei_komoku\n    decimal shouhizei_gaku\n  }\n`,
  gantt: `gantt
  title バージョンアップ計画
  dateFormat  YYYY-MM-DD
  section 準備
  影響調査        :done,    s1, 2025-09-01, 3d
  リスク整理        :active,  s2, after s1, 4d
  section 実装・検証
  実装              :        s3, after s2, 5d
  回帰テスト        :        s4, after s3, 3d
`,
  timeline: `timeline\n  title リリース履歴\n  2025-08-01 : v1.0 リリース\n  2025-08-15 : Hotfix 1\n  2025-09-01 : v1.1 機能追加\n`
};

// 追加サンプル：環境別（DEV/UAT/PROD）テンプレ
SAMPLES["env_flow"] = `flowchart LR
  classDef dev fill:#d1fae5,stroke:#065f46,stroke-width:1px
  classDef uat fill:#fef3c7,stroke:#92400e,stroke-width:1px
  classDef prod fill:#fee2e2,stroke:#991b1b,stroke-width:1px

  GIT[タグ v1.0.2] --> CI[CI: Build & Test]
  CI --> REG[(Container Registry)]

  subgraph DEV[DEV]
    D1([Deploy v1.0.2])
    D2([Smoke Test OK])
  end

  subgraph UAT[UAT]
    U1([Deploy v1.0.2])
    U2([UAT OK])
  end

  subgraph PROD[PROD]
    P1([Release v1.0.2])
  end

  REG --> D1 --> D2 --> U1 --> U2 --> P1
  D2 --> Q{承認OK?}
  Q -- はい --> U1
  Q -- いいえ --> GIT

  class D1,D2 dev
  class U1,U2 uat
  class P1 prod
`;

SAMPLES["env_gantt"] = `gantt
  title 環境別リリース計画（v1.0.2）
  dateFormat  YYYY-MM-DD
  section DEV
  Deploy(DEV)      :done,    d1, 2025-09-02, 1d
  Smoke            :active,  d2, after d1, 1d
  section UAT
  Deploy(UAT)      :         u1, after d2, 1d
  UAT確認          :         u2, 2d
  section PROD
  CAB承認           :         p0, after u2, 1d
  Deploy(PROD)     :         p1, after p0, 1d
`;

SAMPLES["gantt_milestone"] = `gantt
  title リリース環境別マイルストーン（2024-07以降／月区切り＋本番強調）
  dateFormat  YYYY-MM-DD
  axisFormat  %Y/%m/%d
  excludes    weekends

  %% ===== 月初マーカー（区切り用ガイド） =====
  section 月区切り（ガイド）
  2024-07 :milestone, 2024-07-01, 1d
  2024-08 :milestone, 2024-08-01, 1d
  2024-09 :milestone, 2024-09-01, 1d
  2024-10 :milestone, 2024-10-01, 1d
  2024-11 :milestone, 2024-11-01, 1d
  2024-12 :milestone, 2024-12-01, 1d
  2025-01 :milestone, 2025-01-01, 1d
  2025-02 :milestone, 2025-02-01, 1d
  2025-03 :milestone, 2025-03-01, 1d
  2025-04 :milestone, 2025-04-01, 1d
  2025-05 :milestone, 2025-05-01, 1d
  2025-06 :milestone, 2025-06-01, 1d
  2025-07 :milestone, 2025-07-01, 1d
  2025-08 :milestone, 2025-08-01, 1d

  %% ===== smbcpos_training =====
  section smbcpos_training
  SMBCPOS18s               :milestone, 2024-07-02, 1d
  SMBCPOS19s               :milestone, 2024-07-16, 1d
  SMBCPOS21s               :milestone, 2024-09-12, 1d

  %% ===== smbcpos_uat =====
  section smbcpos_uat
  SMBCPOS19s               :milestone, 2024-07-18, 1d
  SMBCPOS21s               :milestone, 2024-09-18, 1d

  %% ===== training =====
  section training
  SMBCPOS20s               :milestone, 2024-07-19, 1d
  SMBCPOS19s（共通）        :milestone, 2024-08-27, 1d
  shima22s                 :milestone, 2024-10-11, 1d
  shima23s                 :milestone, 2024-12-06, 1d
  shima24s                 :milestone, 2024-12-19, 1d
  shima24.5s               :milestone, 2024-12-24, 1d
  shima25s                 :milestone, 2025-03-24, 1d
  shima26s                 :milestone, 2025-07-04, 1d
  shima27s                 :milestone, 2025-08-18, 1d

  %% ===== uat2 =====
  section uat2
  SMBCPOS20s               :milestone, 2024-07-24, 1d
  SMBCPOS19s               :milestone, 2024-09-10, 1d
  shima22s                 :milestone, 2024-10-15, 1d
  shima23s                 :milestone, 2024-12-12, 1d
  shima24s                 :milestone, 2024-12-26, 1d
  shima24.5s               :milestone, 2024-12-26, 1d
  shima25s                 :milestone, 2025-03-31, 1d
  shima26s                 :milestone, 2025-07-10, 1d
  shima27s                 :milestone, 2025-08-22, 1d

  %% ===== honban（本番は crit=赤で強調） =====
  section honban
  SMBCPOS20s               :crit, milestone, 2024-08-08, 1d
  SMBCPOS19s               :crit, milestone, 2024-09-24, 1d
  shima22s                 :crit, milestone, 2024-10-28, 1d
  shima23s                 :crit, milestone, 2024-12-19, 1d
  shima24s                 :crit, milestone, 2025-02-13, 1d
  shima24.5s               :crit, milestone, 2025-02-13, 1d
  shima25s                 :crit, milestone, 2025-04-14, 1d
  shima26s                 :crit, milestone, 2025-07-24, 1d`;

// 追加サンプル：dev起点・凍結中はshishiにチェリーピックして本番UP
SAMPLES["git_dev_shishi_cp"] = `%%{init: { "gitGraph": { "mainBranchName": "schoolmng_dev", "showBranches": true, "showCommitLabel": true } }}%%
gitGraph LR:
  %% 左端：昔から存在していた体の見せ方（可視化用ダミー）
  commit id:"dummy_id_start"

  %% 本番ライン（本番入りのみ連番タグ）— 起点を shimauma28s に変更
  branch schoolmng
  checkout schoolmng
  commit id:"prod-28" tag:"shimauma28s" type:HIGHLIGHT

  %% === 凍結開始：本番デプロイのみ停止（dev→schoolmng は継続）===
  commit id:"freeze-start" type:HIGHLIGHT

  %% 障害（稀）用ライン：最後の本番タグ以降の schoolmng から派生
  branch schoolmng_shishi

  %% --- 凍結中：MySQLバージョンアップ対応マージ（dev→schoolmng）を小刻みに実施 ---
  checkout schoolmng_dev
  commit id:"feat-200"
  commit id:"fix-201"
  checkout schoolmng
  merge schoolmng_dev
  commit id:"mysql-upg-sync-1"

  checkout schoolmng_dev
  commit id:"feat-202"
  checkout schoolmng
  merge schoolmng_dev
  commit id:"mysql-upg-sync-2"

  checkout schoolmng_dev
  commit id:"feat-203"
  commit id:"refactor-204"
  checkout schoolmng
  merge schoolmng_dev
  commit id:"mysql-upg-sync-3"

  %% （稀）障害対応：必要コミットだけ shishi へ cherry-pick→本番に小さく出す
  checkout schoolmng_dev
  commit id:"fix-205"
  checkout schoolmng_shishi
  cherry-pick id:"fix-205"
  commit id:"urgent-hotfix" tag:"shimauma29s" type:HIGHLIGHT

  %% 凍結中も upg 対応マージは継続
  checkout schoolmng_dev
  commit id:"feat-206"
  checkout schoolmng
  merge schoolmng_dev
  commit id:"mysql-upg-sync-4"

  %% === 凍結解除直後：まず shishi を本線へ畳む → その後 shishi を削除（運用）===
  checkout schoolmng
  merge schoolmng_shishi
  commit id:"unfreeze" type:HIGHLIGHT
  %% （運用メモ）ここで schoolmng_shishi を削除

  %% 通常リリース再開：解除時点の schoolmng ヘッドで本番タグ付与（連番で 30s）
  commit id:"prod-30" tag:"shimauma30s" type:HIGHLIGHT

  %% dev の“生存線”を右端まで伸ばす可視化用ダミー
  checkout schoolmng_dev
  commit id:"dummy_id_tail"`;