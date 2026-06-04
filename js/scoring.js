// ══════════════════════════════════════════════════════════
// SCORING MODEL — weighted formula
// ══════════════════════════════════════════════════════════
function scoreHypothesis(text, strat) {
  const t = text.toLowerCase();
  const focus  = strat.focus.toLowerCase();
  const focus2 = (strat.focus2 || '').toLowerCase();
  const af = strat.antiFocus.map(a => a.toLowerCase());
  const metric = strat.targetMetric.toLowerCase();

  // ── A. STRATEGIC FIT (0–5) via weighted formula ──
  // 1. focus_match (0–2)
  const focusKw = {
    acquisition:   ['привлеч','рефераль','виральн','трафик','seo','органич','партнёрск','бесплатн','tier','новых'],
    activation:    ['онбординг','активац','первый шаг','туториал','шаблон','барьер','welcome','aha','blank'],
    retention:     ['удержан','retention','возврат','streak','push','уведомлен','дайджест','stickiness','лоялн','churn'],
    monetization:  ['монетизац','оплат','биллинг','тариф','pro-план','premium','ltv','arpu','апгрейд','подписк'],
    infrastructure:['рефакторинг','технич','мониторинг','автотест','производительн','debt','api','архитектур','инфраструктур'],
  };
  const fKws = focusKw[focus] || [];
  const f2Kws = focusKw[focus2] || [];
  const fMatch = fKws.filter(k => t.includes(k)).length;
  const f2Match = f2Kws.filter(k => t.includes(k)).length;
  const focus_match = Math.min(2, fMatch * 0.8 + f2Match * 0.4);

  // 2. anti_focus_penalty (-2…0)
  let anti_focus_penalty = 0;
  af.forEach(a => {
    const afKws = focusKw[a] || [];
    const afMatch = afKws.filter(k => t.includes(k)).length;
    if (afMatch >= 2) anti_focus_penalty = Math.max(anti_focus_penalty, -2);
    else if (afMatch >= 1) anti_focus_penalty = Math.max(anti_focus_penalty, -1);
  });

  // 3. metric_alignment (0–2)
  const metricKw = {
    'mrr': ['монетизац','оплат','подписк','revenue','доход','тариф','pro'],
    'arr': ['монетизац','annual','годовая','enterprise','b2b'],
    'dau/mau': ['engagement','вовлеч','streak','ежедневн','активн'],
    'retention 30d': ['удержан','retention','streak','возврат','push'],
    'cac': ['привлеч','рефераль','стоимость','канал','трафик'],
    'ltv': ['удержан','lояльн','подписк','ltv','churn','apru'],
    'конверсия': ['онбординг','апгрейд','барьер','воронк','cta'],
    'nps': ['удовлетвор','качеств','поддержк','experience'],
    'revenue': ['монетизац','оплат','доход','тариф','b2b'],
  };
  const mKws = metricKw[metric] || [];
  const mMatch = mKws.filter(k => t.includes(k)).length;
  const metric_alignment = Math.min(2, mMatch * 0.7);

  // 4. constraint_feasibility (0–1)
  const compKw = ['система','интеграц','биллинг','архитектур','инфраструктур','api','бэкенд','движок','рефакторинг'];
  const compCount = compKw.filter(k => t.includes(k)).length;
  const highComplexity = compCount >= 2;
  let constraint_feasibility = 1;
  if (highComplexity && strat.resource === '1 команда') constraint_feasibility = 0.3;
  else if (highComplexity && strat.budget === 'low') constraint_feasibility = 0.5;
  else if (highComplexity && strat.devCap === 'low') constraint_feasibility = 0.4;

  const rawFit = focus_match + anti_focus_penalty + metric_alignment + constraint_feasibility;
  const fit = Math.max(0, Math.min(5, Math.round(rawFit * (5/5.0))));

  // ── B. IMPACT (0–5) ──
  const impactKw = ['рост','масштаб','монетизац','revenue','виральн','x2','удвоен','критич','ltv','конверс','ключевой','core','основн'];
  const impCount = impactKw.filter(k => t.includes(k)).length;
  const impact = Math.min(5, 2 + impCount);

  // ── C. COMPLEXITY (0–5) ──
  const complexity = compCount >= 2 ? 5 : compCount === 1 ? 4 : t.length > 150 ? 3 : t.length > 60 ? 2 : 1;

  // ── D. CONFIDENCE (0–5) ──
  // Based on causal chain quality
  const hasMechanism = t.includes('потому что') || t.includes('так как') || t.includes('что позволит') || t.includes('это приведёт') || t.includes('за счёт');
  const hasMetric = /\d+%|\d+ пользовател|\d+ дней|метрик|измер/.test(t);
  const isVague = ['возможно','может быть','наверное','непонятно'].some(k => t.includes(k));
  // Check against strategic hypotheses
  const contradicts = strat.stratHyps && strat.stratHyps.some(h => {
    return h.toLowerCase().split(' ').filter(w=>w.length>4).some(w => t.includes(w) && anti_focus_penalty < 0);
  });
  let confidence = 4;
  if (hasMechanism) confidence = Math.min(5, confidence + 1);
  if (hasMetric) confidence = Math.min(5, confidence + 1);
  if (isVague) confidence = Math.max(1, confidence - 2);
  if (!hasMechanism && !hasMetric) confidence = Math.max(2, confidence - 1);
  if (contradicts) confidence = Math.max(1, confidence - 1);

  // ── VERDICT ──
  let verdict;
  if (fit >= 4 && complexity <= 3) verdict = 'now';
  else if (fit >= 3) verdict = 'next';
  else if (fit === 2) verdict = 'later';
  else verdict = 'reject';

  // ── DEPTH ──
  let depth;
  if (impact >= 4 || (fit >= 4 && complexity >= 4) || anti_focus_penalty < -1) depth = 'deep';
  else if (impact >= 3 || complexity >= 3) depth = 'standard';
  else depth = 'quick';

  return { fit, impact, complexity, confidence, verdict, depth,
    focus_match: Math.round(focus_match*10)/10,
    anti_focus_penalty,
    metric_alignment: Math.round(metric_alignment*10)/10,
    constraint_feasibility: Math.round(constraint_feasibility*10)/10,
    hasMechanism, hasMetric, compCount,
  };
}

// ── CAUSAL CHAIN ──
function buildCausalChain(text, scores, strat) {
  const t = text.toLowerCase();

  // Detect what user described
  const actionKw = {
    'реферальная механика': ['рефераль','реферальн'],
    'онбординг': ['онбординг','туториал','first step'],
    'push-уведомления': ['push','уведомлен','нотификац'],
    'новый тариф/план': ['тариф','pro','premium','план'],
    'интеграция': ['интеграц','api','вебхук'],
    'редизайн': ['редизайн','ux','интерфейс','дизайн'],
    'аналитика': ['аналитик','дашборд','метрик'],
    'партнёрство': ['партнёрств','интеграц с'],
  };
  let action = 'Инициатива';
  for (const [name, kws] of Object.entries(actionKw)) {
    if (kws.some(k => t.includes(k))) { action = name; break; }
  }

  // Behaviour prediction
  const behaviourMap = {
    'реферальная механика': 'Пользователи приглашают друзей → виральный рост базы',
    'онбординг': 'Новые пользователи быстрее доходят до ценности продукта',
    'push-уведомления': 'Неактивные пользователи возвращаются в продукт',
    'новый тариф/план': 'Пользователи free-tier конвертируются в платящих',
    'интеграция': 'Продукт встраивается в рабочий процесс пользователя',
    'редизайн': 'Снижается трение при выполнении ключевых действий',
    'аналитика': 'Пользователи видят ценность → повышается вовлечённость',
    'партнёрство': 'Новые каналы привлечения + доверие через ассоциацию',
  };
  const behaviour = behaviourMap[action] || 'Пользователи меняют поведение в продукте';

  // Intermediate metric
  const interMap = {
    'реферальная механика': 'Новые регистрации / Viral coefficient',
    'онбординг': 'Activation rate / Time-to-value',
    'push-уведомления': 'DAU / Return rate',
    'новый тариф/план': 'Conversion rate / MRR',
    'интеграция': 'Retention / Daily active rate',
    'редизайн': 'Conversion rate / Task completion',
    'аналитика': 'Engagement / Feature adoption',
    'партнёрство': 'Acquisition / Referral traffic',
  };
  const interMetric = interMap[action] || 'Ключевая engagement-метрика';

  // Target metric
  const targetMetric = strat.targetMetric;

  // Find weak links
  const weakLinks = [];
  if (!scores.hasMechanism) weakLinks.push('Не описан механизм влияния — неясно, почему изменится поведение пользователя');
  if (!scores.hasMetric) weakLinks.push(`Нет измеримой метрики — сложно отследить влияние на ${targetMetric}`);
  if (scores.anti_focus_penalty < -1) weakLinks.push(`Инициатива направлена в зону anti-focus — она работает против стратегии квартала`);
  if (scores.confidence <= 2) weakLinks.push('Низкий confidence: описание слишком размытое или противоречиво');

  // Logical gap to target
  const focusToTarget = {
    Acquisition: { MRR:'Больше пользователей → больше конверсий → рост MRR', ARR:'Расширение базы → корп. контракты → рост ARR', 'Retention 30d':'⚠️ Acquisition напрямую не влияет на 30d retention' },
    Activation:  { 'DAU/MAU':'Быстрый AHA → регулярное использование → DAU/MAU↑', MRR:'Активированные пользователи конвертируются лучше', 'Retention 30d':'Activation — прямой предиктор 30d retention' },
    Retention:   { 'DAU/MAU':'Удержание → ежедневные визиты → DAU/MAU↑', LTV:'Меньше churn → LTV↑', MRR:'Меньше оттока → стабильный MRR' },
    Monetization:{ MRR:'Конверсия в платных → прямой рост MRR', ARR:'Годовые подписки → ARR↑', LTV:'Рост ARPU → LTV↑' },
    Infrastructure:{ 'DAU/MAU':'Стабильность → доверие → retention', MRR:'Косвенно через улучшение experience' },
  };
  const focusMap = focusToTarget[strat.focus] || {};
  const gapText = focusMap[targetMetric] || `${strat.focus} → ${targetMetric}: логическая цепочка требует проверки`;

  return { action, behaviour, interMetric, targetMetric, gapText, weakLinks };
}

// ── GENERATE CONFLICT ──
function generateConflict(scores, strat) {
  const msgs = [];
  if (scores.anti_focus_penalty <= -2) msgs.push(`<strong>Прямой конфликт с anti-focus.</strong> Инициатива направлена в зону, от которой мы намеренно отказались (${strat.antiFocus.join(', ')}).`);
  else if (scores.anti_focus_penalty < 0) msgs.push(`Частичное пересечение с anti-focus (${strat.antiFocus.join(', ')}). Требует осторожности.`);
  if (scores.fit <= 2) msgs.push(`Слабое соответствие фокусу квартала (${strat.focus}). Инициатива смещает ресурс не туда.`);
  if (!msgs.length) return '<div class="conflict-box ok">✓ Нет стратегических конфликтов. Инициатива соответствует фокусу.</div>';
  return msgs.map(m => `<div class="conflict-box">⚠️ ${m}</div>`).join('');
}

// ── GENERATE ALTS ──
function generateAlts(text, prod) {
  const pname = prod ? prod.name : 'продукта';
  const short = text.length > 55 ? text.substring(0,52)+'…' : text;
  return [
    { cls:'alt-lean', label:'Lean', desc:`Минимальная версия: ${short}. Только ключевая механика без интеграций и edge cases — 1–2 недели, минимум SP.` },
    { cls:'alt-exp',  label:'Experiment', desc:`A/B-тест на 10–15% аудитории ${pname}. Замерить целевую метрику через 2 недели — решить по данным, не по мнению.` },
    { cls:'alt-full', label:'Full', desc:`Полная реализация с аналитикой, edge cases и масштабируемой архитектурой — 4–6 недель, высокие вложения.` },
  ];
}
