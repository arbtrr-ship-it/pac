// ══════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════
function openModal(id) {
  const item = history.find(h => h.id === id);
  if (!item) return;
  const vc = {now:'verdict-now',next:'verdict-next',later:'verdict-later',reject:'verdict-reject'};
  const vl = {now:'Now',next:'Next',later:'Later',reject:'Reject'};
  const scoreNames = [
    {key:'fit',label:'Strategic Fit'},{key:'impact',label:'Impact'},
    {key:'complexity',label:'Complexity'},{key:'confidence',label:'Confidence'},
  ];

  document.getElementById('modalTitle').textContent = item.text.substring(0,90)+(item.text.length>90?'…':'');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">Полный текст</div>
      <div class="modal-text-box">${esc(item.text)}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Вердикт и оценки</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <span class="verdict-badge ${vc[item.zone]}">${vl[item.zone]}</span>
        ${item.isAI?'<span style="font-size:.75rem;background:#EDE9FE;color:#5B21B6;padding:3px 10px;border-radius:6px;font-weight:600">AI-инициатива</span>':''}
        <span style="font-size:.8rem;color:var(--muted)">${fmtDate(item.ts)}</span>
      </div>
      <div class="modal-score-row">
        ${scoreNames.map(s => {
          const v = item.scores[s.key];
          const color = s.key==='complexity'?(v>=4?'var(--danger)':v>=3?'var(--warn)':'var(--success)'):(v>=4?'var(--success)':v>=3?'var(--accent)':'var(--warn)');
          return `<div class="modal-score-chip"><div class="val" style="color:${color}">${v}/5</div><div class="lbl">${s.label}</div></div>`;
        }).join('')}
      </div>
      <div style="font-size:.78rem;color:var(--muted);margin-top:10px" class="mono">
        focus_match: ${item.scores.focus_match} · metric_align: ${item.scores.metric_alignment} · af_penalty: ${item.scores.anti_focus_penalty} · feasibility: ${item.scores.constraint_feasibility}
      </div>
    </div>

    ${item.causal ? `
    <div class="modal-section">
      <div class="modal-section-title">Причинная цепочка</div>
      <div class="chain" style="margin:0">
        <div class="chain-node" style="min-width:80px"><div class="cn-lbl">Инициатива</div><div class="cn-val">${esc(item.causal.action)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node" style="min-width:80px"><div class="cn-lbl">Поведение</div><div class="cn-val">${esc(item.causal.behaviour)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node" style="min-width:80px"><div class="cn-lbl">Метрика</div><div class="cn-val">${esc(item.causal.interMetric)}</div></div>
        <div class="chain-arrow">→</div>
        <div class="chain-node" style="min-width:80px"><div class="cn-lbl">Target</div><div class="cn-val">${esc(item.causal.targetMetric)}</div></div>
      </div>
      <div style="font-size:.78rem;color:var(--muted);background:#F7F8FF;border-radius:8px;padding:8px 12px;margin-top:8px">${esc(item.causal.gapText)}</div>
      ${item.causal.weakLinks.map(w=>`<div class="weak-link" style="margin-top:6px">⚠️ <span>${esc(w)}</span></div>`).join('')}
    </div>
    ` : ''}

    <div class="modal-section">
      <div class="modal-section-title">Стратегический анализ</div>
      ${item.conflictHtml}
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Варианты реализации</div>
      ${item.alts.map(a=>`<div class="modal-alt"><span class="alt-badge ${a.cls}">${a.label}</span><span style="font-size:.85rem">${esc(a.desc)}</span></div>`).join('')}
    </div>

    ${item.stratCtx ? `
    <div class="modal-section">
      <div class="modal-section-title">Контекст стратегии v${item.stratCtx.version}</div>
      <div class="modal-text-box">
        <div class="modal-ctx">
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Продукт</div><div class="modal-ctx-val">${item.prodCtx?esc(item.prodCtx.name):'—'}</div></div>
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Цель</div><div class="modal-ctx-val">${item.stratCtx.targetMetric} → ${esc(item.stratCtx.targetVal)}</div></div>
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Фокус</div><div class="modal-ctx-val">${item.stratCtx.focus}${item.stratCtx.focus2?' + '+item.stratCtx.focus2:''}</div></div>
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Anti-focus</div><div class="modal-ctx-val" style="color:#B91C1C">${item.stratCtx.antiFocus.join(', ')||'—'}</div></div>
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Ресурс</div><div class="modal-ctx-val">${item.stratCtx.resource}</div></div>
          <div class="modal-ctx-item"><div class="modal-ctx-lbl">Дедлайн</div><div class="modal-ctx-val">${item.stratCtx.targetDate}</div></div>
        </div>
      </div>
    </div>
    ` : ''}
  `;

  document.getElementById('detailModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('detailModal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e) {
  if (e.target === document.getElementById('detailModal')) closeModal();
}
