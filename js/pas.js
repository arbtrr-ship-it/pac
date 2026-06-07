// ══════════════════════════════════════════════════════════
// PRODUCT ARCHITECTURE SCORE
// ══════════════════════════════════════════════════════════
function updatePAS() {
  if (!strategy) return;
  const all = [...roadmap.now,...roadmap.next,...roadmap.later,...roadmap.reject,...history.filter(h=>!roadmap.now.concat(roadmap.next,roadmap.later,roadmap.reject).find(r=>r.id===h.id))];
  const total = history.length;
  if (total === 0) return;

  // Criteria
  const distribution = (() => {
    const counts = ZONES.map(z => roadmap[z].length);
    const mx = Math.max(...counts);
    const sum = counts.reduce((a,b)=>a+b,0);
    if (sum === 0) return 50;
    return mx/sum < 0.6 ? 100 : mx/sum < 0.75 ? 65 : 30;
  })();

  const metricLink = (() => {
    const withMetric = history.filter(h => h.scores.confidence >= 4).length;
    return Math.round((withMetric/total)*100);
  })();

  const causalQuality = (() => {
    const withChain = history.filter(h => h.scores.hasMechanism || h.scores.hasMetric).length;
    return Math.round((withChain/total)*100);
  })();

  const nowHealth = roadmap.now.length <= 3 ? 100 : roadmap.now.length <= 5 ? 60 : 20;

  const fitAvg = history.length ? Math.round(history.reduce((a,h)=>a+h.scores.fit,0)/history.length*20) : 50;

  pasScore = Math.round((distribution*0.25 + metricLink*0.2 + causalQuality*0.2 + nowHealth*0.2 + fitAvg*0.15));
  pasScore = Math.min(100, Math.max(0, pasScore));

  document.getElementById('pasVal').textContent = pasScore;
  document.getElementById('pasBar').style.width = pasScore + '%';
  const bar = document.getElementById('pasBar');
  bar.style.background = pasScore >= 70 ? 'var(--success)' : pasScore >= 45 ? 'var(--warn)' : 'var(--danger)';

  document.getElementById('pasCardTitle').textContent = `Индекс зрелости архитектуры: ${pasScore}/100`;
  document.getElementById('pasBreakdown').innerHTML = `
    <div class="econ-row">
      <div class="econ-item"><div class="econ-lbl">Распределение</div><div class="econ-val ${distribution>=80?'econ-pos':distribution>=50?'econ-neu':'econ-neg'}">${distribution}/100</div></div>
      <div class="econ-item"><div class="econ-lbl">Связка с метрикой</div><div class="econ-val ${metricLink>=70?'econ-pos':metricLink>=40?'econ-neu':'econ-neg'}">${metricLink}/100</div></div>
      <div class="econ-item"><div class="econ-lbl">Причинные цепочки</div><div class="econ-val ${causalQuality>=70?'econ-pos':causalQuality>=40?'econ-neu':'econ-neg'}">${causalQuality}/100</div></div>
      <div class="econ-item"><div class="econ-lbl">Здоровье Now</div><div class="econ-val ${nowHealth>=80?'econ-pos':nowHealth>=50?'econ-neu':'econ-neg'}">${nowHealth}/100</div></div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════
// ALERTS & SNAPSHOT
// ══════════════════════════════════════════════════════════
function checkAlerts() {
  const total = Object.values(roadmap).reduce((a,v)=>a+v.length,0);
  const msgs = [];
  if (roadmap.now.length > 3) msgs.push(`Фокус перегружен: в колонке "Now" ${roadmap.now.length} задачи (норма ≤ 3).`);
  if (total >= 3) {
    ZONES.forEach(z => {
      if (roadmap[z].length/total >= 0.7) {
        msgs.push(`70%+ задач в "${ZONE_LABEL[z]}" — возможен стратегический перекос.`);
      }
    });
  }
  document.getElementById('dotRoadmap').classList.toggle('show', msgs.length > 0);
  const el = document.getElementById('overloadAlert');
  if (msgs.length) { document.getElementById('alertText').innerHTML = msgs.join('<br>'); el.classList.add('show'); }
  else el.classList.remove('show');
}

function renderSnapshot() {
  const total = Object.values(roadmap).reduce((a,v)=>a+v.length,0);
  const snap = document.getElementById('snapshotBlock');
  if (total < 3) { snap.classList.add('hidden'); return; }
  const nowCount = roadmap.now.length;
  const warnings = [];
  if (nowCount > 3) warnings.push(`Колонка "Now" перегружена (${nowCount} задачи).`);
  const pcts = ZONES.map(z => {
    const p = Math.round((roadmap[z].length/total)*100);
    return `<span style="opacity:.8">${ZONE_LABEL[z]}</span>: <strong>${p}%</strong>`;
  }).join(' · ');
  snap.classList.remove('hidden');
  snap.innerHTML = `
    <div class="snapshot-card fade-in">
      <div class="snapshot-title">Снимок архитектуры продукта</div>
      <div class="snapshot-sub">${strategy ? esc(strategy.product.name)+' · ' : ''}PAS: <strong>${pasScore}/100</strong></div>
      <div class="snapshot-stats">
        <div class="snap-stat"><div class="snap-stat-val">${total}</div><div class="snap-stat-lbl">Инициатив</div></div>
        <div class="snap-stat"><div class="snap-stat-val">${nowCount}</div><div class="snap-stat-lbl">В Now</div></div>
        <div class="snap-stat"><div class="snap-stat-val">${strategy ? strategy.focus : '—'}</div><div class="snap-stat-lbl">Фокус</div></div>
        <div class="snap-stat"><div class="snap-stat-val">v${strategy ? strategy.version : '—'}</div><div class="snap-stat-lbl">Стратегия</div></div>
      </div>
      <div style="font-size:.82rem;opacity:.75;margin-bottom:14px">${pcts}</div>
      ${warnings.map(w=>`<div class="snapshot-warn">⚠️ ${w}</div>`).join('')}
      <div class="snapshot-quote">Теперь решения принимаются в контексте стратегии, а не изолированно.</div>
      <button class="btn btn-ghost btn-full" style="margin-top:18px;border-color:rgba(255,255,255,.3);color:#fff;background:rgba(255,255,255,.1)" onclick="resetAll()">Начать заново</button>
    </div>
  `;
}
