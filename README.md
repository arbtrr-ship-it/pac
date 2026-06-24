# PAC — Product Architecture Copilot

AI-ассистент для продуктовых менеджеров: помогает формулировать стратегию,
анализировать гипотезы инициатив и управлять роадмапом.

Целевая аудитория — product managers и CPO, которым нужна структурированная
система для принятия приоритетных решений.

## Tech stack

- Vanilla JavaScript (ES6+), без фреймворков и сборки
- Vanilla CSS (Custom Properties, Grid, Flexbox)
- HTML5
- Хостинг: Netlify (статика + SPA-редиректы через `_redirects`)

## Структура

```
pac/
├── index.html      # HTML-каркас
├── styles.css      # Все стили
├── js/             # 12 модулей в глобальной области видимости
│   ├── state.js    # глобальные переменные
│   ├── scoring.js  # скоринг гипотез и причинно-следственные цепочки
│   ├── strategy.js # стратегия и версии
│   ├── roadmap.js  # роадмап и drag&drop
│   ├── analysis.js # анализ гипотез (UI)
│   ├── pas.js      # Product Architecture Score
│   └── ...
└── _redirects      # Netlify SPA fallback
```

Порядок загрузки в `index.html` важен: `state.js` и `utils.js` — первыми,
`app.js` — последним (содержит init-вызовы).

## Запуск локально

```bash
# любой статический сервер из корня репозитория
python3 -m http.server 8000
# открыть http://localhost:8000
```

Никакой установки зависимостей или сборки не требуется — приложение
открывается сразу.

## Документация

Подробности по архитектуре, скоринговой модели, бизнес-логике (AARRR, PAS)
и соглашениям — в [`CLAUDE.md`](./CLAUDE.md).
