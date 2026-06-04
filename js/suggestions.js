// ══════════════════════════════════════════════════════════
// HYPOTHESIS SUGGESTIONS
// ══════════════════════════════════════════════════════════
function generateSuggestions() {
  if (!strategy) return;
  const focus = strategy.focus;
  const af = strategy.antiFocus;
  const aud = strategy.product.audience;
  const pname = strategy.product.name;
  const cat = strategy.product.category;
  const metric = strategy.targetMetric;

  const byFocus = {
    Acquisition: [
      `Реферальная программа: ${aud} получают бонус за каждого приглашённого`,
      `Бесплатный tier — снизить барьер входа и увеличить воронку`,
      `Виральная механика «Поделиться результатом» — рост через контент`,
      `SEO-стратегия: статьи под запросы целевой аудитории ${aud}`,
      `Партнёрская программа для привлечения через смежные сервисы`,
    ],
    Activation: [
      `Редизайн онбординга: сократить путь до «aha moment» до 3 шагов`,
      `Интерактивный туториал с подсказками для новых пользователей ${pname}`,
      `Welcome-последовательность: 5 email за первую неделю`,
      `Библиотека шаблонов «Начни с готового» — устранить blank slate`,
      `Персонализация онбординга по сегменту ${aud}`,
    ],
    Retention: [
      `Push-уведомления о прогрессе — возврат неактивных пользователей`,
      `Механика streak / серий — поощрение регулярного использования`,
      `Еженедельный дайджест: персональная статистика для ${aud}`,
      `Collaboration-фичи: совместная работа повышает stickiness`,
      `Программа лояльности — бонусы за длительную подписку`,
    ],
    Monetization: [
      `Pro-план с расширенными функциями — апгрейд для продвинутых ${aud}`,
      `Годовая подписка со скидкой — повышение LTV и снижение churn`,
      `Freemium-ограничения с in-app апгрейд-промптами в нужный момент`,
      `Командный тариф по числу мест — B2B-монетизация`,
      `Add-on модули за отдельную плату — расширение ARPU`,
    ],
    Infrastructure: [
      `Рефакторинг ключевых компонентов — снизить tech debt и ускорить доставку`,
      `Улучшить мониторинг и алертинг — сократить время восстановления`,
      `Автотестирование критических флоу — уменьшить регрессии`,
      `Оптимизация производительности — улучшить core user experience`,
    ],
  };
  const byCat = {
    'SaaS B2B': [`Командный дашборд и управление ролями для корпоративных клиентов`, `API и вебхуки для интеграций`],
    'EdTech': [`Сертификаты по завершению — мотивация ${aud}`, `Групповые когорты — социальная составляющая`],
    'FinTech': [`Аналитика и персональные рекомендации для ${aud}`, `Автоматические правила — экономия времени`],
    'Маркетплейс': [`Программа «Верифицированный продавец»`, `Рекомендательный движок`],
    'HealthTech': [`Трекер прогресса с визуализацией динамики`, `Интеграция с носимыми устройствами`],
  };

  let list = [...(byFocus[focus] || [])];
  if (byCat[cat]) list = [...list, ...byCat[cat]];
  // Filter out anti-focus topics
  if (af.length) {
    const afKw = { Acquisition:['привлеч','рефераль','виральн','seo','партнёрск'], Activation:['онбординг','туториал','шаблон','приветств'], Retention:['streak','push','дайджест','лоялн'], Monetization:['pro-план','годовая','freemium','тариф'], Infrastructure:['рефакторинг','тест','мониторинг'] };
    af.forEach(a => {
      const kws = afKw[a] || [];
      list = list.filter(s => !kws.some(k => s.toLowerCase().includes(k)));
    });
  }
  list = list.sort(() => Math.random() - 0.5).slice(0,6);
  window._hypSuggestions = list;
  document.getElementById('hypChips').innerHTML = list.map((s,i) =>
    `<button class="hyp-chip" data-idx="${i}" onclick="selectChip(this)">${esc(s)}</button>`
  ).join('');
}

function selectChip(el) {
  document.querySelectorAll('.hyp-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const idx = parseInt(el.getAttribute('data-idx'), 10);
  const text = window._hypSuggestions[idx] || el.textContent;
  document.getElementById('hypText').value = text;
  document.getElementById('hypText').focus();
}

function checkAIBanner() {
  if (!strategy) return;
  const total = Object.values(roadmap).reduce((a,v)=>a+v.length,0);
  if (total === 0) return;
  const focusKw = {
    Acquisition:['привлеч','рефераль','виральн','трафик'],
    Activation:['онбординг','туториал','шаблон'],
    Retention:['удержан','streak','push'],
    Monetization:['монетизац','тариф','pro'],
    Infrastructure:['рефакторинг','мониторинг'],
  };
  const focus = strategy.focus;
  const kws = focusKw[focus] || [];
  const hasFocusItem = history.some(h => kws.some(k => h.text.toLowerCase().includes(k)));
  const banner = document.getElementById('aiSuggestBanner');
  if (!hasFocusItem) {
    banner.classList.remove('hidden');
    banner.innerHTML = `
      <div class="ai-panel fade-in">
        <div class="ai-panel-title">🤖 Замечание PAC</div>
        <div class="ai-panel-sub">В roadmap нет инициатив по текущему фокусу: <strong>${focus}</strong>. Выбери одну из предложенных выше или опиши свою.</div>
      </div>
    `;
  } else {
    banner.classList.add('hidden');
  }
}
