// ══════════════════════════════════════════════════════════
// ANALYZE
// ══════════════════════════════════════════════════════════
function analyzeHyp() {
  const text = document.getElementById('hypText').value.trim();
  if (!text) { alert('Введи описание инициативы'); return; }
  if (!strategy) { alert('Сначала сохрани стратегию'); return; }

  document.getElementById('analysisResult').classList.add('hidden');
  document.getElementById('analysisWrap').classList.remove('visible');
  const thinking = document.getElementById('thinkingAnim');
  thinking.classList.add('show');

  // Animated thinking labels
  const labels = ['Оцениваю стратегический fit…','Строю причинную цепочку…','Анализирую архитектурные риски…','Считаю экономику…'];
  let li = 0;
  const labelEl = document.getElementById('thinkingLabel');
  const interval = setInterval(() => { li=(li+1)%labels.length; labelEl.textContent = labels[li]; }, 600);

  setTimeout(() => {
    clearInterval(interval);
    thinking.classList.remove('show');
    labelEl.textContent = 'PAC анализирует гипотезу';

    const scores = scoreHypothesis(text, strategy);
    const causal = buildCausalChain(text, scores, strategy);
    const alts = generateAlts(text, product);
    const conflictHtml = generateConflict(scores, strategy);
    currentAnalysis = { text, scores, causal, alts, conflictHtml, ts: new Date(), isAI: false };

    renderAnalysis(currentAnalysis);

    document.getElementById('analysisResult').classList.remove('hidden');
    setTimeout(() => document.getElementById('analysisWrap').classList.add('visible'), 50);
  }, scores ? 2500 : 2500);

  // Pre-calc scores for timing
  var scores = scoreHypothesis(text, strategy);
}

function renderAnalysis(analysis) {
  const { scores, causal, alts, conflictHtml } = analysis;

  // Depth badge
  const depthMap = { quick:['Quick Analysis','depth-quick'], standard:['Standard Analysis','depth-standard'], deep:['Deep Architecture Review','depth-deep'] };
  const db = document.getElementById('depthBadge');
  db.textContent = depthMap[scores.depth][0];
  db.className = 'depth-badge ' + depthMap[scores.depth][1];

  // Verdict
  const vb = document.getElementById('verdictBadge');
  vb.textContent = ZONE_LABEL[scores.verdict];
  vb.className = 'verdict-badge ' + ZONE_CLASS[scores.verdict];

  // Scores
  const scoreItems = [
    { key:'fit',        label:'Strategic Fit', note:'Weighted formula' },
    { key:'impact',     label:'Impact',        note:'На target-метрику' },
    { key:'complexity', label:'Complexity',    note:'Инженерная нагрузка' },
    { key:'confidence', label:'Confidence',    note:'Качество гипотезы' },
  ];
  document.getElementById('scoreGrid').innerHTML = scoreItems.map(s => {
    const v = scores[s.key];
    const pct = (v/5)*100;
    const color = s.key==='complexity'
      ? (v>=4?'var(--danger)':v>=3?'var(--warn)':'var(--success)')
      : (v>=4?'var(--success)':v>=3?'var(--accent)':'var(--warn)');
    return `<div class="score-item">
      <div class="score-name">${s.label}</div>
      <div class="score-row">
        <div class="score-val">${v}<span style="font-size:.75rem;opacity:.4">/5</span></div>
        <div class="score-bar"><div class="score-fill" style="width:${pct}%;background:${color}"></div></div>
      </div>
      <div style="font-size:.65rem;color:var(--muted)">${s.note}</div>
    </div>`;
  }).join('');

  // Strategic layer
  document.getElementById('conflictBlock').innerHTML = conflictHtml;

  // Causal chain (show only for standard/deep)
  let chainHtml = '';
  if (scores.depth !== 'quick') {
    const broken = causal.weakLinks.length > 0;
    chainHtml = `
      <div style="font-size:.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin:16px 0 10px;">Причинно-следственная цепочка</div>
      <div class="chain">
        <div class="chain-node"><div class="cn-lbl">Инициатива</div><div class="cn-val">${esc(causal.action)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node"><div class="cn-lbl">Поведение</div><div class="cn-val">${esc(causal.behaviour)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node"><div class="cn-lbl">Метрика</div><div class="cn-val">${esc(causal.interMetric)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node ${broken?'broken':''}"><div class="cn-lbl">Target</div><div class="cn-val">${esc(causal.targetMetric)}</div></div>
      </div>
      <div style="font-size:.8rem;color:var(--muted);background:#F7F8FF;border-radius:8px;padding:8px 12px;margin-top:8px;">${esc(causal.gapText)}</div>
      ${causal.weakLinks.map(w => `<div class="weak-link">⚠️ <span>${esc(w)}</span></div>`).join('')}
    `;
  }
  document.getElementById('causalChain').innerHTML = chainHtml;

  // Architectural layer
  const total = Object.values(roadmap).reduce((a,v)=>a+v.length,0);
  const archRisk = scores.complexity >= 4 ? 'high' : scores.complexity >= 3 ? 'medium' : 'low';
  const archRiskLabel = { high:'High Risk', medium:'Medium Risk', low:'Low Risk' };
  const focusItems = Object.entries(
    [...roadmap.now,...roadmap.next].reduce((acc,item) => {
      const zone = item.zone; acc[zone]=(acc[zone]||0)+1; return acc;
    },{})
  );
  const activeCount = roadmap.now.length + roadmap.next.length;
  document.getElementById('archBlock').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <div class="risk-badge risk-${archRisk}">${archRiskLabel[archRisk]}</div>
      ${scores.compCount >= 2 ? '<span style="font-size:.8rem;color:var(--muted);">Высокая техническая сложность</span>' : ''}
    </div>
    ${scores.complexity >= 4 && strategy.resource === '1 команда' ? '<div class="conflict-box">⚠️ Высокая сложность при ресурсе "1 команда" — риск перегруза команды.</div>' : ''}
    ${scores.complexity >= 4 && strategy.devCap === 'low' ? '<div class="conflict-box">⚠️ Низкая dev-мощность не соответствует сложности инициативы.</div>' : ''}
    ${roadmap.now.length >= 3 ? `<div class="conflict-box">⚠️ В Now уже ${roadmap.now.length} задачи — добавление создаст перегруз фокуса.</div>` : '<div class="conflict-box ok">✓ Нет перегруза Now-колонки.</div>'}
    <div style="font-size:.8rem;color:var(--muted);margin-top:10px;">Активных инициатив (Now+Next): <strong>${activeCount}</strong></div>
  `;

  // Economic layer
  const econMap = {
    Acquisition:   { ltv:'neutral',   cac:'strengthens', cod:'medium', coi: scores.complexity >= 4 ? 'high' : 'medium' },
    Activation:    { ltv:'strengthens', cac:'neutral',  cod:'high',   coi: scores.complexity >= 3 ? 'medium' : 'low' },
    Retention:     { ltv:'strengthens', cac:'neutral',  cod:'high',   coi:'medium' },
    Monetization:  { ltv:'strengthens', cac:'neutral',  cod:'high',   coi: scores.complexity >= 4 ? 'high' : 'medium' },
    Infrastructure:{ ltv:'neutral',   cac:'neutral',  cod:'low',    coi:'high' },
  };
  const econ = econMap[strategy.focus] || econMap.Acquisition;
  const eLabel = { strengthens:'Positive', neutral:'Neutral', risky:'Risky', low:'Low', medium:'Medium', high:'High' };
  const eCls = { strengthens:'econ-pos', neutral:'econ-neu', risky:'econ-neg', low:'econ-pos', medium:'econ-neu', high:'econ-neg' };
  document.getElementById('econBlock').innerHTML = `
    <div class="econ-row">
      <div class="econ-item"><div class="econ-lbl">Влияние на LTV</div><div class="econ-val ${eCls[econ.ltv]}">${eLabel[econ.ltv]}</div></div>
      <div class="econ-item"><div class="econ-lbl">Влияние на CAC</div><div class="econ-val ${eCls[econ.cac]}">${eLabel[econ.cac]}</div></div>
      <div class="econ-item"><div class="econ-lbl">Cost of Delay</div><div class="econ-val ${eCls[econ.cod]}">${eLabel[econ.cod]}</div></div>
      <div class="econ-item"><div class="econ-lbl">Cost of Implementation</div><div class="econ-val ${eCls[econ.coi]}">${eLabel[econ.coi]}</div></div>
    </div>
    <div style="font-size:.8rem;color:var(--muted);background:#F7F8FF;border-radius:8px;padding:10px 14px;">
      ${econ.cod==='high' ? '⚡ Высокий Cost of Delay — откладывание снизит ценность инициативы.' : econ.cod==='low' ? '⏳ Низкий Cost of Delay — инициатива не теряет ценность при переносе.' : '↔ Умеренный Cost of Delay — можно планировать без срочности.'}
    </div>
  `;

  // Alts
  document.getElementById('altsBlock').innerHTML = alts.map(a =>
    `<div class="alt-item"><span class="alt-badge ${a.cls}">${a.label}</span><span>${esc(a.desc)}</span></div>`
  ).join('');
}

function switchLayer(name, btn) {
  document.querySelectorAll('.layer-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.layer-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('layer-'+name).classList.add('active');
}
