// ══════════════════════════════════════════════════════════
// ADD TO ROADMAP
// ══════════════════════════════════════════════════════════
function addToRoadmap(analysisObj, fromAI) {
  const a = analysisObj || currentAnalysis;
  if (!a) return;
  const { text, scores, causal, alts, conflictHtml, ts } = a;
  const id = 'rm-'+Date.now()+Math.random().toString(36).slice(2,6);
  const item = {
    id, text, scores, causal, alts, conflictHtml, ts,
    zone: scores.verdict, isAI: !!fromAI,
    stratCtx: strategy ? { ...strategy } : null,
    prodCtx: product ? { name:product.name, category:product.category, audience:product.audience } : null,
  };
  roadmap[scores.verdict].push(item);
  history.push(item);
  if (!fromAI) {
    document.getElementById('hypText').value = '';
    document.querySelectorAll('.hyp-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('analysisResult').classList.add('hidden');
    document.getElementById('analysisWrap').classList.remove('visible');
    currentAnalysis = null;
    showTab('roadmap');
  }
  renderRoadmap();
  renderHistory();
  checkAlerts();
  updatePAS();
  checkAIBanner();
}

// ══════════════════════════════════════════════════════════
// RENDER ROADMAP
// ══════════════════════════════════════════════════════════
function renderRoadmap() {
  ZONES.forEach(z => {
    document.getElementById('cnt-'+z).textContent = roadmap[z].length;
    document.getElementById('items-'+z).innerHTML = roadmap[z].map(item => `
      <div class="rm-card" id="${item.id}" draggable="true"
           ondragstart="onDragStart(event,'${item.id}')" ondragend="onDragEnd(event)">
        <div class="rm-card-title">${esc(item.text.substring(0,TRUNC_CARD))}${item.text.length>TRUNC_CARD?'…':''}</div>
        <div class="rm-card-meta">Fit ${item.scores.fit}/5 · Conf ${item.scores.confidence}/5 · ${fmtDate(item.ts)}</div>
        <div class="rm-card-badges">
          <span class="rm-card-badge ${item.isAI?'badge-ai':'badge-user'}">${item.isAI?'AI':'User'}</span>
          <span class="rm-card-badge" style="background:#F7F8FF;color:var(--muted)">v${item.stratCtx?item.stratCtx.version:'?'}</span>
        </div>
        <button class="rm-card-btn" onclick="event.stopPropagation();openModal('${item.id}')">Полный анализ →</button>
      </div>
    `).join('');
  });
  renderSnapshot();
}

function renderHistory() {
  if (!history.length) return;
  document.getElementById('historyList').innerHTML = [...history].reverse().map(item => `
    <div class="history-item" onclick="openModal('${item.id}')">
      <div class="history-dot ${DOT_CLASS[item.zone]}"></div>
      <div style="flex:1">
        <div style="font-weight:500;line-height:1.4">${esc(item.text.substring(0,TRUNC_HIST))}${item.text.length>TRUNC_HIST?'…':''}</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:2px">${fmtDate(item.ts)} ${item.isAI?'· <span style="color:var(--purple)">AI-инициатива</span>':''}</div>
        <div class="history-hint">Нажми для полного анализа →</div>
      </div>
      <span class="verdict-badge ${ZONE_CLASS[item.zone]}" style="flex-shrink:0;font-size:.7rem;padding:3px 11px">${ZONE_LABEL[item.zone]}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════════════════
// DRAG & DROP
// ══════════════════════════════════════════════════════════
function onDragStart(e,id) { dragId=id; e.target.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; }
function onDragEnd(e) { e.target.classList.remove('dragging'); dragId=null; document.querySelectorAll('.rm-drop-zone').forEach(z=>z.classList.remove('drag-over')); }
function onDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function onDrop(e,zone) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (!dragId) return;
  let item=null;
  ZONES.forEach(z => { const idx=roadmap[z].findIndex(i=>i.id===dragId); if(idx!==-1){item=roadmap[z].splice(idx,1)[0];} });
  if (item) {
    item.zone = zone;
    roadmap[zone].push(item);
    const hi = history.find(h=>h.id===item.id);
    if (hi) hi.zone = zone;
    renderRoadmap(); renderHistory(); checkAlerts(); updatePAS();
  }
}
