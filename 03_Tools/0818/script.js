(function(){
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const presetEl = $('#preset');
  const methodEl = $('#method');
  const urlEl = $('#url');
  const paramsEl = $('#params');
  const headersEl = $('#headers');
  const bodyWrap = $('#bodyWrap');
  const bodyEl = $('#body');
  const sendBtn = $('#send');
  const cancelBtn = $('#cancel');
  const curlEl = $('#curl code');
  const stEl = $('#st');
  const tmEl = $('#tm');
  const szEl = $('#sz');
  const ctEl = $('#ct');
  const jsonViewerEl = $('#json-viewer');
  const textEl = $('#text code');
  const respHeadersEl = $('#respHeaders code');
  const reqEl = $('#req code');
  const schemaInfoContainer = $('#schema-info-container');
  const schemaInfoEl = $('#schema-info');
  let controller = null;
  let presets = [];

  // Main App Logic
  async function initializeApp() {
    try {
      const response = await fetch('./data/presets.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      presets = await response.json();
      loadPresets();
    } catch (error) {
      console.error('Failed to load presets:', error);
      if (jsonViewerEl) jsonViewerEl.innerHTML = `<code style="color:var(--bad)">APIプリセットの読み込みに失敗しました。<br>./data/presets.jsonを確認してください。<br>${error}</code>`;
    }
  }

  function renderSchemaInfo(schema) {
    if (!schema) {
      schemaInfoContainer.style.display = 'none';
      return;
    }

    let html = '';
    if (schema.docs) {
      html += `<p><a href="${schema.docs}" target="_blank">公式ドキュメントはこちら ↗</a></p>`;
    }

    const renderSection = (title, params) => {
      if (!params || Object.keys(params).length === 0) return '';
      let sectionHtml = `<h4>${title}</h4>`;
      sectionHtml += '<ul>';
      for (const [key, desc] of Object.entries(params)) {
        sectionHtml += `<li><code>${key}</code>: ${desc}</li>`;
      }
      sectionHtml += '</ul>';
      return sectionHtml;
    };

    html += renderSection('URLパスパラメータ', schema.url_params);
    html += renderSection('クエリパラメータ', schema.params);
    html += renderSection('リクエストボディ (JSON)', schema.body);

    schemaInfoEl.innerHTML = html;
    schemaInfoContainer.style.display = html.trim() ? '' : 'none';
  }

  function loadPresets(){
    presetEl.innerHTML = '';
    presets.forEach((p,i)=>{
      const o=document.createElement('option');o.value=i;o.textContent=p.name;presetEl.appendChild(o);
    });
    presetEl.selectedIndex=0;
    applyPreset(0);
  }

  function applyPreset(idx){
    const p = presets[idx];
    methodEl.value = p.method;
    urlEl.value = p.url;
    renderKV(paramsEl, p.params || [], p.schema?.params);
    renderKV(headersEl, p.headers || [], p.schema?.headers);
    bodyEl.value = p.body || '';
    bodyWrap.style.display = ['POST','PUT','PATCH','DELETE'].includes(p.method) ? '' : 'none';
    renderSchemaInfo(p.schema);
    updateCurl();
  }

  function renderKV(container, data, schema) {
    container.innerHTML='';
    const items = (data && data.length > 0) ? data : [['','']];
    items.forEach(([k,v])=> addKV(container, k, v, schema));
  }

  function addKV(container, k='', v='', schema){
    const row=document.createElement('div');
    const inputRow = document.createElement('div');
    inputRow.className='kv-row';
    const kEl=document.createElement('input');kEl.placeholder='key';kEl.value=k;
    const vEl=document.createElement('input');vEl.placeholder='value';vEl.value=v;
    const rm=document.createElement('button');rm.className='btn';rm.textContent='－';
    rm.onclick=()=>{row.remove();updateCurl()};
    
    const hint = document.createElement('div');
    hint.className = 'param-hint';

    const updateHint = () => {
      const key = kEl.value;
      if (schema && schema[key]) {
        hint.textContent = schema[key];
      } else {
        hint.textContent = '';
      }
    };

    kEl.addEventListener('input', () => { updateCurl(); updateHint(); });
    vEl.addEventListener('input', updateCurl);

    inputRow.append(kEl,vEl,rm);
    row.appendChild(inputRow);
    row.appendChild(hint);
    container.appendChild(row);
    updateHint();
  }

  $('#addParam').onclick=()=>addKV(paramsEl, '', '', presets[presetEl.value]?.schema?.params);
  $('#addHeader').onclick=()=>addKV(headersEl, '', '', presets[presetEl.value]?.schema?.headers);

  methodEl.onchange=()=>{bodyWrap.style.display=['POST','PUT','PATCH','DELETE'].includes(methodEl.value)?'':'none';updateCurl()};
  urlEl.oninput=updateCurl; bodyEl.oninput=updateCurl;
  presetEl.onchange=(e)=>applyPreset(+e.target.value);

  function collectKV(container){
    const list=[]; container.querySelectorAll('.kv-row').forEach(row=>{
      const [kEl,vEl]=row.querySelectorAll('input');
      if(kEl.value) list.push([kEl.value,vEl.value]);
    }); return list;
  }

  function buildURL(){
    const base = urlEl.value.trim();
    const ps = collectKV(paramsEl);
    if (!base) return '';
    try {
      const u = new URL(base);
      ps.forEach(([k,v])=>{ if(k) u.searchParams.set(k,v) });
      return u.toString();
    } catch(e) {
      return base;
    }
  }

  function buildHeaders(){
    const hs = collectKV(headersEl);
    const h = {}; hs.forEach(([k,v])=>{ if(k) h[k]=v });
    if(['POST','PUT','PATCH','DELETE'].includes(methodEl.value)){
      try{ if(bodyEl.value && !h['Content-Type']) h['Content-Type']='application/json' }catch(e){}
    }
    return h;
  }

  function updateCurl(){
    const method = methodEl.value;
    const full = buildURL();
    const headers = buildHeaders();
    const hs = Object.entries(headers).map(([k,v])=>`-H ${q(k+': '+v)}`).join(' ');
    const body = (['POST','PUT','PATCH','DELETE'].includes(method) && bodyEl.value) ? `--data ${q(bodyEl.value)}` : '';
    const cmd = `curl -X ${method} ${hs} ${body} ${q(full)}`.replace(/\s+/g,' ').trim();
    curlEl.textContent = cmd;
    reqEl.textContent = JSON.stringify({method,url:full,headers,body:bodyEl.value||null}, null, 2);
  }

  function q(s){return `'`+String(s).replaceAll(`'`,`'"'"'`)+`'`}

  function prettyBytes(n){
    if(n==null||isNaN(n)) return '—';
    const u=['B','KB','MB','GB'];
    let i=0;while(n>=1024&&i<u.length-1){n/=1024;i++}return n.toFixed(2)+' '+u[i];
  }

  async function send(){
    sendBtn.disabled=true; stEl.textContent='...';
    controller = new AbortController(); const signal = controller.signal;
    const method=methodEl.value; const url=buildURL(); const headers=buildHeaders();
    if (!url) {
      stEl.innerHTML = `<span class="pill-bad">Error</span>`;
      renderJsonViewer(jsonViewerEl, {error: 'URLが空です'});
      sendBtn.disabled = false;
      return;
    }
    let body=null; if(['POST','PUT','PATCH','DELETE'].includes(method) && bodyEl.value){
      try{ body = JSON.stringify(JSON.parse(bodyEl.value)); }catch(e){ body = bodyEl.value }
    }
    const t0 = performance.now(); let size=null; let type='—';
    try{
      const res = await fetch(url,{method,headers,body,signal});
      const t1 = performance.now();
      stEl.innerHTML = `${res.status} ${res.ok?'<span class="pill-ok">OK</span>':'<span class="pill-bad">NG</span>'}`;
      tmEl.textContent = (t1 - t0).toFixed(1)+' ms';
      type = res.headers.get('content-type')||'—'; ctEl.textContent=type;
      const cl = res.headers.get('content-length');
      let text = await res.text();
      size = cl ? parseInt(cl,10) : (new TextEncoder().encode(text)).length;
      szEl.textContent = prettyBytes(size);
      respHeadersEl.textContent = [...res.headers.entries()].map(([k,v])=>k+': '+v).join('\n')||'(no headers)';
      try {
        const jsonData = JSON.parse(text);
        renderJsonViewer(jsonViewerEl, jsonData);
        setTab('json');
      } catch(e) {
        textEl.textContent = text;
        setTab('text');
      }
    }catch(err){
      tmEl.textContent = '—'; ctEl.textContent='—';
      szEl.textContent = '—'; stEl.innerHTML = `<span class="pill-bad">Error</span>`;
      const msg = (err.name==='AbortError')? '中止されました（AbortController）' : (err.message||String(err));
      renderJsonViewer(jsonViewerEl, {error: msg, hint: 'CORS が原因の場合は同一オリジンのプロキシを挟むか、サーバ側で Access-Control-Allow-Origin を設定してください。'});
      setTab('json');
    } finally{
      sendBtn.disabled=false; controller=null;
    }
  }

  function abort(){ if(controller) controller.abort() }

  function setTab(name){
    $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
    ['json','text','headers','request'].forEach(id=>{
      $('#panel-'+id).style.display = (id===name)?'block':'none';
    });
  }

  $$('.tab').forEach(t=> t.addEventListener('click',()=> setTab(t.dataset.tab)) );
  $('#send').onclick=send;
  $('#cancel').onclick=abort;

  document.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' && e.shiftKey){
      e.preventDefault();
      const r=document.createRange(); r.selectNodeContents(curlEl);
      const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try{ document.execCommand('copy'); showToast('cURL をコピーしました') }catch(_){ }
      sel.removeAllRanges();
    }
  });

  function showToast(msg){
    const d=document.createElement('div');
    d.textContent=msg; d.style.position='fixed'; d.style.bottom='16px'; d.style.right='16px';
    d.style.background='#0c1b3d'; d.style.border='1px solid #2b3a69'; d.style.borderRadius='10px';
    d.style.padding='10px 12px'; d.style.boxShadow='0 6px 20px rgba(0,0,0,.35)'; d.style.zIndex=5;
    document.body.appendChild(d); setTimeout(()=>d.remove(),1500);
  }

  // JSON Viewer Functions
  function renderJsonViewer(container, data) {
    container.innerHTML = '';
    const tree = buildTreeElement(data, false, 0);
    container.appendChild(tree);
  }

  function isTableau(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const firstEl = arr[0];
    if (typeof firstEl !== 'object' || firstEl === null || Array.isArray(firstEl)) return false;
    const firstKeys = Object.keys(firstEl);
    if (firstKeys.length === 0) return false;
    return arr.every(item => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) return false;
      const keys = Object.keys(item);
      if (keys.length !== firstKeys.length) return false;
      return firstKeys.every(key => keys.includes(key));
    });
  }

  function createTableauResult(arr, depth) {
    const mainContainer = document.createElement('div');
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headers = Object.keys(arr[0]);

    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    arr.forEach(obj => {
      const row = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.appendChild(buildTreeElement(obj[header], true, depth + 1));
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    const treeContainer = createArrayTreeElement(arr, true, depth);
    treeContainer.style.display = 'none';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn';
    toggleButton.textContent = 'ツリー表示に切替';
    toggleButton.style.marginBottom = '8px';
    toggleButton.style.fontSize = '12px';
    toggleButton.style.padding = '4px 8px';

    toggleButton.onclick = () => {
      const isTableVisible = tableContainer.style.display !== 'none';
      tableContainer.style.display = isTableVisible ? 'none' : '';
      treeContainer.style.display = isTableVisible ? '' : 'none';
      toggleButton.textContent = isTableVisible ? 'テーブル表示に切替' : 'ツリー表示に切替';
    };
    
    mainContainer.appendChild(toggleButton);
    mainContainer.appendChild(tableContainer);
    mainContainer.appendChild(treeContainer);

    return mainContainer;
  }

  function createArrayTreeElement(data, isCollapsed, depth) {
      const item = document.createElement('div');
      item.className = 'item' + (isCollapsed ? ' collapsed' : '');

      const toggler = document.createElement('span');
      toggler.className = 'toggler';
      toggler.onclick = (e) => {
        item.classList.toggle('collapsed');
        e.stopPropagation();
      };

      const valueContainer = document.createElement('div');
      valueContainer.className = 'value';

      const startBrace = document.createElement('span');
      startBrace.className = 'bracket';
      startBrace.textContent = '[';
      
      const ellipsis = document.createElement('span');
      ellipsis.className = 'ellipsis';
      ellipsis.textContent = `[...] (${data.length} items)`;
      ellipsis.style.display = 'none';

      item.appendChild(toggler);
      item.appendChild(startBrace);
      item.appendChild(ellipsis);
      
      const entries = Object.entries(data);
      if (entries.length > 0) {
        item.appendChild(valueContainer);
        entries.forEach(([key, val], index) => {
          const child = document.createElement('div');
          child.className = 'item';
          
          const shouldCollapse = depth > 0;
          child.appendChild(buildTreeElement(val, shouldCollapse, depth + 1));

          if (index < entries.length - 1) {
            child.appendChild(document.createTextNode(','));
          }
          valueContainer.appendChild(child);
        });
      }

      const endBrace = document.createElement('span');
      endBrace.className = 'bracket';
      endBrace.textContent = ']';
      item.appendChild(endBrace);

      return item;
  }

  function buildTreeElement(data, isCollapsed, depth) {
    const type = typeof data;
    const isArray = Array.isArray(data);

    if (data === null) return createValueElement('null', 'null');
    if (type === 'string') {
      if (data.startsWith('http://') || data.startsWith('https://')) {
        const a = document.createElement('a');
        a.href = data;
        a.target = '_blank';
        a.textContent = `"${data}"`;
        return createValueElement(null, 'string', a);
      }
      return createValueElement(`"${data}"`, 'string');
    }
    if (type === 'number') return createValueElement(data, 'number');
    if (type === 'boolean') return createValueElement(data, 'boolean');

    if (type === 'object') {
      if (isArray) {
        if (isTableau(data)) {
          return createTableauResult(data, depth);
        }
        return createArrayTreeElement(data, isCollapsed, depth);
      }

      const item = document.createElement('div');
      item.className = 'item' + (isCollapsed ? ' collapsed' : '');

      const toggler = document.createElement('span');
      toggler.className = 'toggler';
      toggler.onclick = (e) => {
        item.classList.toggle('collapsed');
        e.stopPropagation();
      };

      const valueContainer = document.createElement('div');
      valueContainer.className = 'value';

      const startBrace = document.createElement('span');
      startBrace.className = 'brace';
      startBrace.textContent = '{';
      
      const ellipsis = document.createElement('span');
      ellipsis.className = 'ellipsis';
      ellipsis.textContent = '{...}';
      ellipsis.style.display = 'none';

      item.appendChild(toggler);
      item.appendChild(startBrace);
      item.appendChild(ellipsis);
      
      const entries = Object.entries(data);
      if (entries.length > 0) {
        item.appendChild(valueContainer);
        entries.forEach(([key, val], index) => {
          const child = document.createElement('div');
          child.className = 'item';
          
          if (!isArray) {
            const keySpan = document.createElement('span');
            keySpan.className = 'key';
            keySpan.textContent = `"${key}": `;
            child.appendChild(keySpan);
          }
          
          const shouldCollapse = depth > 0;
          child.appendChild(buildTreeElement(val, shouldCollapse, depth + 1));

          if (index < entries.length - 1) {
            child.appendChild(document.createTextNode(','));
          }
          valueContainer.appendChild(child);
        });
      }

      const endBrace = document.createElement('span');
      endBrace.className = 'brace';
      endBrace.textContent = '}';
      item.appendChild(endBrace);

      return item;
    }
    return createValueElement('Unsupported', 'null');
  }

  function createValueElement(value, className, element = null) {
    const span = document.createElement('span');
    span.className = className;
    if (element) {
      span.appendChild(element);
    } else {
      span.textContent = value;
    }
    return span;
  }

  // ===== Windows 配慮の cURL 生成（Bash / PowerShell / cmd 切替） =====
  const shellSel = document.createElement('select');
  shellSel.id = 'shell'; shellSel.style.marginLeft = '8px';
  shellSel.innerHTML = '<option value="bash">Bash</option><option value="pwsh">PowerShell</option><option value="cmd">cmd.exe</option>';
  const curlWrap = document.querySelector('#curl');
  if (curlWrap && curlWrap.parentElement) { curlWrap.parentElement.insertBefore(shellSel, curlWrap); }
  shellSel.addEventListener('change', updateCurl);

  function buildCurlFor(shell, method, full, headers, body) {
    const hs = Object.entries(headers || {});
    if (shell === 'bash') {
      const H = hs.map(([k, v]) => `-H ${q_bash(k + ': ' + v)}`).join(' ');
      const D = (['POST','PUT','PATCH','DELETE'].includes(method) && body) ? `--data ${q_bash(body)}` : '';
      return `curl -X ${method} ${H} ${D} ${q_bash(full)}`.replace(/\s+/g, ' ').trim();
    }
    if (shell === 'pwsh') {
      const H = hs.map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
      const D = (['POST','PUT','PATCH','DELETE'].includes(method) && body) ? `--data '${body}'` : '';
      return `curl.exe -X ${method} ${H} ${D} "${full}"`.replace(/\s+/g, ' ').trim();
    }
    const H = hs.map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
    const bodyEsc = body ? body.replace(/"/g, '"') : '';
    const D = (['POST','PUT','PATCH','DELETE'].includes(method) && body) ? `--data "${bodyEsc}"` : '';
    return `curl -X ${method} ${H} ${D} "${full}"`.replace(/\s+/g, ' ').trim();
  }

  function q_bash(s) { return `'` + String(s).replaceAll(`'`, `'` + `"'"` + `'`) + `'`; }

  const __oldUpdateCurl = updateCurl;
  updateCurl = function () {
    const method = methodEl.value;
    const full = buildURL();
    const headers = buildHeaders();
    const body = (['POST','PUT','PATCH','DELETE'].includes(method) && bodyEl.value) ? bodyEl.value : '';
    const shell = (document.querySelector('#shell') || { value: 'bash' }).value;
    const cmd = buildCurlFor(shell, method, full, headers, body);
    curlEl.textContent = cmd;
    reqEl.textContent = JSON.stringify({ method, url: full, headers, body: bodyEl.value || null }, null, 2);
  }

  // OAuth 2.0 Logic
  const oa = {
    auth: document.getElementById('oa_auth'),
    token: document.getElementById('oa_token'),
    client: document.getElementById('oa_client'),
    redirect: document.getElementById('oa_redirect'),
    scope: document.getElementById('oa_scope'),
    state: document.getElementById('oa_state'),
    begin: document.getElementById('oa_begin'),
    reset: document.getElementById('oa_reset'),
    status: document.getElementById('oa_status'),
    curlPS: document.getElementById('oa_curl_ps').querySelector('code'),
    curlCMD: document.getElementById('oa_curl_cmd').querySelector('code'),
    result: document.getElementById('oa_result').querySelector('code'),
  };
  if (oa.redirect) oa.redirect.value = location.origin + location.pathname;

  function rand(n){const a=new Uint8Array(n); crypto.getRandomValues(a); return a}
  function b64u(buf){return btoa(String.fromCharCode(...buf)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
  async function sha256Buf(str){
    const enc = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return new Uint8Array(digest);
  }
  function genVerifier(){ return b64u(rand(32)) }

  oa.begin && oa.begin.addEventListener('click', async()=>{
    if(!oa.auth.value || !oa.token.value || !oa.client.value){ oa.status.textContent='必須項目が未入力です'; return; }
    const verifier = genVerifier();
    const challenge = b64u(await sha256Buf(verifier));
    const state = oa.state.value || b64u(rand(8));
    const u = new URL(oa.auth.value);
    u.searchParams.set('response_type','code');
    u.searchParams.set('client_id', oa.client.value);
    u.searchParams.set('redirect_uri', oa.redirect.value);
    u.searchParams.set('code_challenge_method','S256');
    u.searchParams.set('code_challenge', challenge);
    const scope = oa.scope.value || 'openid profile email';
    u.searchParams.set('scope', scope);
    u.searchParams.set('state', state);

    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('pkce_state', state);
    sessionStorage.setItem('pkce_token_ep', oa.token.value);
    sessionStorage.setItem('pkce_client', oa.client.value);
    sessionStorage.setItem('pkce_redirect', oa.redirect.value);

    oa.status.textContent = 'authorize へリダイレクト中…';
    location.assign(u.toString());
  });

  oa.reset && oa.reset.addEventListener('click', ()=>{
    ['pkce_verifier','pkce_state','pkce_token_ep','pkce_client','pkce_redirect'].forEach(k=> sessionStorage.removeItem(k));
    oa.status.textContent='—'; oa.result.textContent='(cleared)';
  });

  (async function handleRedirect(){
    const q = new URLSearchParams(location.search);
    const code = q.get('code'); const state = q.get('state');
    if(!code) return;
    const expState = sessionStorage.getItem('pkce_state');
    if(expState && state !== expState){ oa.status.textContent='state 不一致'; return; }
    const verifier = sessionStorage.getItem('pkce_verifier');
    const tokenEP = sessionStorage.getItem('pkce_token_ep');
    const client = sessionStorage.getItem('pkce_client');
    const redir = sessionStorage.getItem('pkce_redirect') || (location.origin + location.pathname);

    oa.status.textContent = 'code 取得。トークン交換を試行中…';

    const body = new URLSearchParams({
      grant_type:'authorization_code', code, client_id:client, redirect_uri:redir, code_verifier:verifier
    }).toString();

    oa.curlPS.textContent = oa.curlPS.textContent
      .replace('{AUTH_CODE}', code)
      .replace('{CODE_VERIFIER}', verifier)
      .replace('{TOKEN_ENDPOINT}', tokenEP)
      .replace('{CLIENT_ID}', client)
      .replace('{REDIRECT_URI}', redir);
    oa.curlCMD.textContent = oa.curlCMD.textContent
      .replace('{AUTH_CODE}', code)
      .replace('{CODE_VERIFIER}', verifier)
      .replace('{TOKEN_ENDPOINT}', tokenEP)
      .replace('{CLIENT_ID}', client)
      .replace('{REDIRECT_URI}', redir);

    try{
      const res = await fetch(tokenEP, {
        method:'POST',
        headers: { 'Content-Type':'application/x-www-form-urlencoded' },
        body
      });
      const txt = await res.text();
      try{ oa.result.textContent = JSON.stringify(JSON.parse(txt), null, 2) }
      catch{ oa.result.textContent = txt }
      oa.status.textContent = `token ${res.ok? 'OK' : 'NG'} (${res.status})`;
    }catch(e){
      oa.result.textContent = JSON.stringify({error:String(e), hint:'CORSで失敗する場合は上の PowerShell / cmd の cURL を使用してください。'}, null, 2);
      oa.status.textContent = 'fetch エラー';
    }
  })();

  // Initial Load
  document.addEventListener('DOMContentLoaded', initializeApp);

})();