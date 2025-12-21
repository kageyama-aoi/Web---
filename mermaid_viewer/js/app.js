(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const editor = $('#editor');
  const preview = $('#preview');
  const errorBox = $('#error');
  const renderBtn = $('#renderBtn');
  const autorun = $('#autorun');
  const themeSel = $('#theme');
  const schemeSel = $('#scheme');
  const scaleInput = $('#scale');
  const fileInput = $('#fileInput');
  const status = $('#status');
  const examples = $('#examples');

  const DEFAULT_CODE = `%% サンプル：フローチャート\nflowchart TD\n  A([開始]) --> B{承認が必要?}\n  B -- はい --> C[承認依頼]\n  B -- いいえ --> D[実行]\n  C --> E[承認済み]\n  E --> D\n  D --> F([完了])\n`;

  // =============== サンプル ===============
  const SAMPLES = {
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

  // =============== ユーティリティ ===============
  function setStatus(msg){ status.textContent = msg || ''; }
  function showError(err){ errorBox.textContent = (err && (err.str || err.message)) || String(err); setStatus(''); }
  function clearError(){ errorBox.textContent=''; }

  function isSandboxed(){
    try{ return location.href.startsWith('about:') || document.baseURI.startsWith('about:') || location.origin === 'null'; }
    catch{ return true; }
  }
  function canUseHistory(){ return !isSandboxed() && !!(history && history.replaceState); }
  function canUseHash(){ return !isSandboxed(); }

  function encodeCode(str){ return btoa(unescape(encodeURIComponent(str))); }
  function decodeCode(str){ try{ return decodeURIComponent(escape(atob(str))); }catch{ return ''; } }

  function updateShareState(code){
    const hash = 'code=' + encodeURIComponent(encodeCode(code));
    try{ if(canUseHistory()){ const url = new URL(location.href); url.hash = hash; history.replaceState(null, '', url); return {ok:true, method:'history'}; } }catch(e){ console.warn('replaceState failed', e); }
    try{ if(canUseHash()){ location.hash = hash; return {ok:true, method:'hash'}; } }catch(e){ console.warn('location.hash failed', e); }
    return {ok:false};
  }

  function loadFromHash(){ if(isSandboxed()) return ''; const m = location.hash.match(/code=([^&]+)/); if(!m) return ''; return decodeCode(decodeURIComponent(m[1])); }

  async function copyText(text){
    try{ await navigator.clipboard.writeText(text); return true; }
    catch{
      try{ const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok; }
      catch{ return false; }
    }
  }

  // Mermaid初期化
  function initMermaid(){ const theme = themeSel.value || 'default'; window.mermaid.initialize({ startOnLoad:false, theme, securityLevel:'loose' }); }

  // gitGraph 互換フィックス（v10系で tag 行が文法外のケース向け）
  function compatFixGitGraph(code){
    if(!/^\s*gitGraph/m.test(code)) return null;
    // 独立した `tag "xxx"` 行を `commit tag: "xxx"` に置換
    const fixed = code.replace(/^\s*tag\s+"([^"]+)"\s*$/gm, '  commit tag: "$1"');
    return fixed !== code ? fixed : null;
  }

  async function render(_attemptedFix){
    const code = editor.value.trim();
    if(!code){ preview.innerHTML = ''; clearError(); setStatus(''); return; }
    try{
      clearError();
      window.mermaid.parse(code); // 構文チェック
      const id = 'm' + Math.random().toString(36).slice(2);
      const { svg, bindFunctions } = await window.mermaid.render(id, code);
      preview.innerHTML = svg; bindFunctions && bindFunctions(preview);
      setStatus('レンダー完了');
      localStorage.setItem('mermaid_viewer_code', code);
      if(canUseHistory() || canUseHash()) updateShareState(code);
    }catch(e){
      // gitGraphの互換フィックスを試行
      if(!_attemptedFix){
        const fixed = compatFixGitGraph(code);
        if(fixed){ editor.value = fixed; setStatus('gitGraph互換フィックス適用: `tag "…"` → `commit tag: "…"`'); return render(true); }
      }
      showError(e);
    }
  }

  let t; function scheduleRender(){ if(!autorun.checked) return; clearTimeout(t); t = setTimeout(render, 400); }

  function saveBlob(text, name, type){
    const blob = new Blob([text], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    try {
      a.click();
    } finally {
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    }
  }

  function getSvgXml(){
    const svg = preview.querySelector('svg');
    if(!svg) throw new Error('SVGが見つかりません');
    const clone = svg.cloneNode(true);
    // 幅/高さを固定
    if (!clone.getAttribute('width') || !clone.getAttribute('height')) {
      const vb = clone.getAttribute('viewBox');
      if (vb) { const [, , w, h] = vb.split(/\s+/).map(Number); clone.setAttribute('width', w); clone.setAttribute('height', h); }
    }
    // 名前空間の明示
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!clone.getAttribute('xmlns:xlink')) clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const xml = new XMLSerializer().serializeToString(clone);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  }

  async function copySvg(){
    const svgText = getSvgXml();
    const ok = await copyText(svgText);
    setStatus(ok ? 'SVGをクリップボードにコピーしました' : 'コピーできませんでした（権限未許可）');
  }
  async function downloadSvg(){
    try{
      const svgText = getSvgXml();
      // まずはBlobダウンロード（推奨）
      try{
        saveBlob(svgText, 'diagram.svg', 'image/svg+xml;charset=utf-8');
        setStatus('SVGを保存しました');
        return;
      }catch(e){ console.warn('Blob download failed, trying data URL', e); }

      // フォールバック1：新規タブで data:URL を開く（Safari等）
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
      const win = window.open(dataUrl, '_blank');
      if(win){ setStatus('新規タブでSVGを開きました（そこで保存できます）'); return; }

      // フォールバック2：クリップボードにSVGテキストをコピー
      const ok = await copyText(svgText);
      setStatus(ok ? '環境制限で自動保存不可。SVGをクリップボードにコピーしました。' : '保存・コピーに失敗しました。PNG保存や.mmd保存をご利用ください。');
    }catch(e){ showError(e); }
  }

  function svgToPng(svgText, scale){ return new Promise((resolve, reject)=>{ const img = new Image(); const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText); img.onload = ()=>{ const w = Math.ceil(img.width * scale); const h = Math.ceil(img.height * scale); const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/png')); }; img.onerror = reject; img.src = encoded; }); }
  async function downloadPng(){ try{ const svgText = getSvgXml(); const scale = Math.max(1, Math.min(6, Number(scaleInput.value) || 2)); const dataUrl = await svgToPng(svgText, scale); const a = document.createElement('a'); a.href = dataUrl; a.download = 'diagram.png'; a.click(); setStatus(`PNGを保存しました（倍率×${scale}）`); }catch(e){ showError(e); } }

  function applyScheme(s){ const root = document.documentElement; if(s === 'auto'){ root.removeAttribute('data-scheme'); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; root.setAttribute('data-scheme', prefersDark ? 'dark' : 'light'); } else { root.setAttribute('data-scheme', s); } localStorage.setItem('mermaid_viewer_scheme', s); }

  // =============== イベント ===============
  editor.addEventListener('input', scheduleRender);
  renderBtn.addEventListener('click', render);
  document.addEventListener('keydown', (e)=>{ if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); render(); } });
  themeSel.addEventListener('change', ()=>{ initMermaid(); render(); localStorage.setItem('mermaid_viewer_theme', themeSel.value); });
  schemeSel.addEventListener('change', ()=> applyScheme(schemeSel.value));

  const loadSelectedSample = () => {
    const k = examples.value;
    if (!k) return;
    editor.value = SAMPLES[k] || DEFAULT_CODE;
    render();
  };
  $('#loadSample').addEventListener('click', loadSelectedSample);
  examples.addEventListener('change', loadSelectedSample);
  $('#openFile').addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', async (e)=>{ const f = e.target.files && e.target.files[0]; if(!f) return; const text = await f.text(); editor.value = text; render(); });
  $('#saveMmd').addEventListener('click', ()=> saveBlob(editor.value, 'diagram.mmd', 'text/plain'));
  $('#copySvg').addEventListener('click', copySvg);
  $('#downloadSvg').addEventListener('click', downloadSvg);
  $('#downloadPng').addEventListener('click', downloadPng);

  $('#shareUrl').addEventListener('click', async ()=>{
    const code = editor.value.trim();
    const res = updateShareState(code);
    if(res.ok){ const ok = await copyText(location.href); setStatus(ok ? `共有URLをコピーしました（方式：${res.method}）` : 'URLのコピーに失敗しました'); }
    else{ const encoded = encodeCode(code); const ok = await copyText(encoded); setStatus(ok ? 'URL更新不可の環境です。代わりに「エンコード済みコード」をコピーしました。別環境で貼り付けてお使いください。' : '共有不可の環境です（クリップボード未許可）。.mmd保存をご利用ください。'); }
  });

  // 自己テスト（エンコード群 + Mermaid構文の最小ケース）
  $('#selfTest').addEventListener('click', ()=>{
    const tests = [];
    function add(name, fn){ try{ const ok = !!fn(); tests.push({name, ok}); } catch(e){ tests.push({name, ok:false, e}); } }
    add('encode/decode ASCII', ()=>{ const s='flowchart TD\nA-->B'; return decodeCode(encodeCode(s))===s; });
    add('encode/decode JP', ()=>{ const s='開始→承認?'; return decodeCode(encodeCode(s))===s; });
    add('sandbox detect', ()=> typeof isSandboxed()==='boolean');
    add('gitGraph v10 parse', ()=>{ window.mermaid.parse(SAMPLES.git); return true; });
    add('flowchart parse', ()=>{ window.mermaid.parse(SAMPLES.flow); return true; });
    add('gantt parse', ()=>{ window.mermaid.parse(SAMPLES.gantt); return true; });
    add('git dev/shishi cp parse', ()=>{ window.mermaid.parse(SAMPLES['git_dev_shishi_cp']); return true; });
    add('env_flow parse', ()=>{ window.mermaid.parse(SAMPLES['env_flow']); return true; });
    add('env_gantt parse', ()=>{ window.mermaid.parse(SAMPLES['env_gantt']); return true; });

    console.table(tests);
    const okAll = tests.every(t=>t.ok);
    setStatus('自己テスト: ' + (okAll ? 'OK' : '一部NG（コンソールを確認）'));
  });

  // =============== 初期ロード ===============
  (function init(){
    // サンプル選択プルダウンを動的に生成
    (function populateSamplesDropdown() {
      const order = [
        'flow',
        'seq',
        'git',
        'git_dev_shishi_cp',
        'state',
        'er',
        'gantt',
        'env_gantt',
        'gantt_milestone',
        'timeline',
        'env_flow',
      ];
      const SAMPLE_LABELS = {
        flow: 'フローチャート',
        seq: 'シーケンス',
        git: 'Gitグラフ（v10表記）',
        git_dev_shishi_cp: 'Gitグラフ（dev起点・凍結はshishiにCP）',
        state: 'ステート',
        er: 'ER',
        gantt: 'ガント',
        env_gantt: '環境別ガント',
        gantt_milestone: 'ガント: マイルストーン',
        timeline: 'タイムライン',
        env_flow: 'デプロイ（環境別 Flow）',
      };
      order.forEach(key => {
        if (!SAMPLES[key]) return;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = SAMPLE_LABELS[key] || key;
        examples.appendChild(option);
      });
    })();

    const savedScheme = localStorage.getItem('mermaid_viewer_scheme') || 'auto'; schemeSel.value = savedScheme; applyScheme(savedScheme);
    const savedTheme = localStorage.getItem('mermaid_viewer_theme') || 'default'; themeSel.value = savedTheme;
    const fromHash = loadFromHash(); const fromLocal = localStorage.getItem('mermaid_viewer_code'); editor.value = fromHash || fromLocal || DEFAULT_CODE;
    const onReady = () => { initMermaid(); render(); }; if(window.mermaid){ onReady(); } else { window.addEventListener('load', onReady, {once:true}); }
  })();
})();