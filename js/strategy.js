// ══════════════════════════════════════════════════════════
// STRATEGY STEPPER
// ══════════════════════════════════════════════════════════
function setStep(active) {
  for (let i=1;i<=3;i++) {
    const el = document.getElementById('step'+i);
    const line = document.getElementById('line'+i);
    el.className = 'step' + (i<active?' done':i===active?' active':'');
    if (i<active) el.querySelector('.step-num').textContent = '✓';
    else el.querySelector('.step-num').textContent = i;
    if (line) line.className = 'step-line' + (i<active?' done':'');
  }
}
function toStep1() {
  setStep(1);
  document.getElementById('stratStep1').classList.remove('hidden');
  document.getElementById('stratStep2').classList.add('hidden');
  document.getElementById('stratStep3').classList.add('hidden');
}
function toStep2() {
  const name = document.getElementById('prodName').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  if (!name) { alert('Введи название продукта'); return; }
  if (!desc)  { alert('Напиши краткое описание'); return; }
  product = {
    name: name,
    category: document.getElementById('prodCategory').value,
    desc: desc,
    value: document.getElementById('prodValue').value.trim(),
    audience: document.getElementById('prodAudience').value.trim() || 'пользователей',
  };
  setStep(2);
  document.getElementById('stratStep1').classList.add('hidden');
  document.getElementById('stratStep2').classList.remove('hidden');
  document.getElementById('stratStep3').classList.add('hidden');
}
function toStep3() {
  setStep(3);
  document.getElementById('stratStep2').classList.add('hidden');
  document.getElementById('stratStep3').classList.remove('hidden');
  document.getElementById('versionPreview').textContent = strategyVersions.length + 1;
}

// Anti-focus chips
function toggleAF(el, val) {
  el.classList.toggle('selected');
}
function getAntiFocus() {
  return Array.from(document.querySelectorAll('.af-chip.selected')).map(el => el.textContent.trim());
}

// Strategic hypotheses
function addStratHyp() {
  const inp = document.getElementById('stratHypInput');
  const val = inp.value.trim();
  if (!val) return;
  stratHyps.push(val);
  renderStratHyps();
  inp.value = '';
}
function removeStratHyp(idx) {
  stratHyps.splice(idx, 1);
  renderStratHyps();
}
function renderStratHyps() {
  document.getElementById('stratHypTags').innerHTML = stratHyps.map((h,i) =>
    `<div class="hyp-tag">${esc(h)}<button onclick="removeStratHyp(${i})">×</button></div>`
  ).join('') || '<div style="font-size:.8rem;color:var(--muted);">Пока пусто — это опционально</div>';
}

function saveStrategy() {
  const antiFocus = getAntiFocus();
  strategy = {
    version: strategyVersions.length + 1,
    ts: new Date(),
    product: { ...product },
    targetMetric: document.getElementById('targetMetric').value,
    baselineVal:  document.getElementById('baselineVal').value,
    targetVal:    document.getElementById('targetVal').value,
    targetDate:   document.getElementById('targetDate').value,
    focus:        document.getElementById('focus').value,
    focus2:       document.getElementById('focus2').value,
    antiFocus:    antiFocus,
    stage:        document.getElementById('stage').value,
    resource:     document.getElementById('resource').value,
    budget:       document.getElementById('budget').value,
    tempo:        document.getElementById('tempo').value,
    devCap:       document.getElementById('devCap').value,
    stratHyps:    [...stratHyps],
  };
  strategyVersions.push({ ...strategy });
  renderContextStrip();
  generateSuggestions();
  renderVersions();
  updatePAS();
  showTab('hypothesis');
}

// ══════════════════════════════════════════════════════════
// CONTEXT STRIP
// ══════════════════════════════════════════════════════════
function renderContextStrip() {
  if (!strategy) return;
  const af = strategy.antiFocus.length ? strategy.antiFocus.join(', ') : '—';
  const focuses = [strategy.focus, strategy.focus2].filter(Boolean).join(' + ');
  document.getElementById('contextStrip').innerHTML = `
    <div class="ctx-item"><span class="ctx-lbl">Продукт</span><span class="ctx-val">${esc(strategy.product.name)}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">Цель</span><span class="ctx-val">${strategy.targetMetric} → ${esc(strategy.targetVal)}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">Дедлайн</span><span class="ctx-val">${strategy.targetDate}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">Фокус</span><span class="ctx-val">${focuses}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">Anti-focus</span><span class="ctx-val af">${af}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">Ресурс</span><span class="ctx-val">${strategy.resource}</span></div>
    <div class="ctx-item"><span class="ctx-lbl">v${strategy.version}</span><span class="ctx-val">${fmtDate(strategy.ts)}</span></div>
  `;
}

// ══════════════════════════════════════════════════════════
// VERSIONS & RETRO
// ══════════════════════════════════════════════════════════
function renderVersions() {
  const block = document.getElementById('retroBlock');
  if (!strategyVersions.length) return;
  document.getElementById('stratVersions').classList.remove('hidden');
  const list = [...strategyVersions].reverse();
  document.getElementById('stratVersionList').innerHTML = list.map(v => `
    <div style="padding:12px 14px;background:#F7F8FF;border-radius:10px;margin-bottom:10px;font-size:.85rem">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span class="version-badge">v${v.version}</span>
        <span style="font-size:.78rem;color:var(--muted)">${fmtDate(v.ts)}</span>
      </div>
      <div>Фокус: <strong>${v.focus}${v.focus2?' + '+v.focus2:''}</strong> · Цель: <strong>${v.targetMetric} → ${esc(v.targetVal)}</strong> · ${v.targetDate}</div>
      ${v.antiFocus.length ? `<div style="font-size:.78rem;color:#B91C1C;margin-top:3px">Anti-focus: ${v.antiFocus.join(', ')}</div>` : ''}
      ${v.stratHyps.length ? `<div style="font-size:.75rem;color:var(--muted);margin-top:4px">${v.stratHyps.length} стратегических гипотез</div>` : ''}
    </div>
  `).join('');
  block.innerHTML = document.getElementById('stratVersionList').outerHTML;
}
