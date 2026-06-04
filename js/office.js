// ══════════════════════════════════════════════════════════
// AI PRODUCT OFFICE
// ══════════════════════════════════════════════════════════
function runAIOffice() {
  if (!strategy) {
    document.getElementById('aiInitiativesBlock').innerHTML = '<div style="font-size:.85rem;color:var(--muted);">Сначала сохрани стратегию.</div>';
    return;
  }
  const all = [...roadmap.now,...roadmap.next,...roadmap.later,...roadmap.reject,...history];
  if (all.length === 0) {
    document.getElementById('aiInitiativesBlock').innerHTML = '<div style="font-size:.85rem;color:var(--muted);">Инициативы появятся после добавления первой гипотезы в roadmap.</div>';
    return;
  }

  // Find gaps
  const ZONES = ['Acquisition','Activation','Retention','Monetization','Infrastructure'];
  const coverage = {};
  ZONES.forEach(z => coverage[z] = 0);
  all.forEach(item => {
    const t = item.text.toLowerCase();
    const kw = {
      Acquisition:['привлеч','рефераль','виральн','трафик'],
      Activation:['онбординг','туториал','шаблон'],
      Retention:['удержан','streak','push','дайджест'],
      Monetization:['монетизац','тариф','pro','ltv'],
      Infrastructure:['рефакторинг','мониторинг','debt'],
    };
    for (const [z, kws] of Object.entries(kw)) {
      if (kws.some(k => t.includes(k))) coverage[z]++;
    }
  });

  const initiatives = [];
  // Focus areas with 0 items
  ZONES.forEach(z => {
    if (coverage[z] === 0 && z === strategy.focus) {
      initiatives.push({
        title: `Нет инициатив по ${z}`,
        reason: `Фокус квартала — ${z}, но в roadmap нет ни одной инициативы этого направления.`,
        suggestion: z === 'Retention' ? 'Рассмотри: push-уведомления, дайджест или streak-механику' :
                    z === 'Acquisition' ? 'Рассмотри: реферальную программу или SEO-контент' :
                    z === 'Monetization' ? 'Рассмотри: Pro-план или апгрейд-промпты' :
                    z === 'Activation' ? 'Рассмотри: онбординг-редизайн или шаблонную библиотеку' : 'Рассмотри infrastructure задачи',
        urgency: 'high',
      });
    } else if (coverage[z] === 0 && !strategy.antiFocus.includes(z)) {
      initiatives.push({
        title: `Слепое пятно: направление ${z} не охвачено`,
        reason: `В roadmap нет инициатив по ${z}, хотя оно не находится в anti-focus.`,
        suggestion: 'Возможно стоит добавить хотя бы 1 эксперимент в этой зоне.',
        urgency: 'medium',
      });
    }
  });

  // Now overload
  if (roadmap.now.length > 3) {
    initiatives.push({
      title: 'Перегруз Now-колонки',
      reason: `В Now ${roadmap.now.length} инициатив — фокус размыт, команда рискует не завершить ничего.`,
      suggestion: 'Переведи 1–2 инициативы в Next или Later.',
      urgency: 'high',
    });
  }

  // Focus concentration
  const total = all.length;
  ZONES.forEach(z => {
    if (coverage[z] / total >= 0.65) {
      initiatives.push({
        title: `Перекос в сторону ${z}`,
        reason: `${Math.round(coverage[z]/total*100)}% инициатив сосредоточены в ${z}. Продукт развивается однобоко.`,
        suggestion: 'Добавь инициативы в смежные направления для баланса.',
        urgency: 'medium',
      });
    }
  });

  if (!initiatives.length) {
    document.getElementById('aiInitiativesBlock').innerHTML = '<div style="font-size:.85rem;color:var(--success);">✓ Явных пробелов нет. Roadmap выглядит сбалансированно.</div>';
    return;
  }

  const urgencyCls = { high:'danger', medium:'warn' };
  document.getElementById('aiInitiativesBlock').innerHTML = initiatives.map((init, idx) => `
    <div class="ai-initiative">
      <div class="ai-initiative-text">
        <div class="ai-initiative-title">
          <span class="section-tag ${urgencyCls[init.urgency]}" style="font-size:.65rem;padding:2px 8px;margin-bottom:0;margin-right:8px;">${init.urgency==='high'?'❗ Важно':'⚠️ Внимание'}</span>
          ${esc(init.title)}
        </div>
        <div class="ai-initiative-reason" style="margin-top:6px;">${esc(init.reason)}</div>
        <div style="font-size:.78rem;color:var(--accent);margin-top:4px;">💡 ${esc(init.suggestion)}</div>
      </div>
    </div>
  `).join('');

  // Update dot
  document.getElementById('dotOffice').classList.add('show');
}
