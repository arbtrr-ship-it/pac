# PAC — Product Architecture Copilot

AI-ассистент для продуктовых менеджеров: помогает формулировать стратегию, анализировать гипотезы инициатив и управлять роадмапом.
Целевая аудитория — product managers и CPO, которым нужна структурированная система для принятия приоритетных решений.

---

## Tech Stack

- **Vanilla JavaScript (ES6+)** — без фреймворков, без npm, без build-step; разбито на 12 модулей в `js/`
- **Vanilla CSS** — CSS Custom Properties, Grid, Flexbox; вынесен в `styles.css`
- **HTML5** — `index.html` содержит только разметку; JS и CSS — в отдельных файлах
- **Netlify** — хостинг статики, SPA-редиректы через `_redirects`
- **Google Fonts** — Syne, DM Sans, DM Mono (подключены через CDN)

---

## Project Structure

```
pac/
├── index.html          # HTML-каркас (~445 строк): разметка + <link>/<script> теги
├── styles.css          # Весь CSS (~291 строка)
├── js/
│   ├── state.js        # Глобальные переменные (product, strategy, roadmap, history…)
│   ├── utils.js        # esc(s), fmtDate(d)
│   ├── scoring.js      # scoreHypothesis, buildCausalChain, generateConflict, generateAlts
│   ├── suggestions.js  # generateSuggestions, selectChip, checkAIBanner
│   ├── strategy.js     # Stepper (setStep/toStep1-3), saveStrategy, renderContextStrip, renderVersions
│   ├── pas.js          # updatePAS, checkAlerts, renderSnapshot
│   ├── roadmap.js      # addToRoadmap, renderRoadmap, renderHistory, drag&drop
│   ├── analysis.js     # analyzeHyp, renderAnalysis, switchLayer
│   ├── office.js       # runAIOffice
│   ├── modal.js        # openModal, closeModal, closeModalOutside
│   ├── nav.js          # showTab
│   └── app.js          # resetAll + init (последний загружается)
├── pac.html            # Meta-refresh редирект на index.html (9 строк)
├── _redirects          # Netlify SPA-редирект: /* /index.html 200
├── README.md           # Минимальный README (только заголовок)
└── CLAUDE.md           # Этот файл
```

Порядок загрузки скриптов в `index.html` важен: `state.js` и `utils.js` — первыми, `app.js` — последним (содержит init-вызовы). Все JS-файлы используют глобальную область видимости, `<script>` теги без `type="module"`.

---

## Conventions

**Коммиты:** нет строгих правил — в истории использовался английский (`Add files via upload`, `Initial commit`). Предпочтителен формат `<type>: <описание>` (feat, fix, refactor, docs).

**Именование файлов:** kebab-case (`index.html`, `pac.html`).

**Ветки:** `claude/<task-slug>` — пример из репозитория. Разработка ведётся в feature-ветках.

**Язык UI:** русский — все тексты, лейблы, сообщения внутри приложения на русском.

**Стиль кода JS:**
- `const`/`let`, arrow functions, template literals
- Функции объявляются через `function` в глобальной области видимости (обращение из HTML `onclick=`)
- HTML-экранирование через `esc(s)` — обязательно для любого user input в DOM

---

## Как со мной разговаривать

Я — продакт-менеджер, код пишу редко. Объясняй решения через продуктовый смысл и поведение приложения, а не через имплементацию. «Когда юзер дропнет карточку в `now`, мы пересчитаем PAS» — да. «Перевешиваем listener в `dragend` через `addEventListener`» — нет, если это не главное в задаче.

**Термины:**
- Продуктовые (AARRR, retention, activation, PAS, north-star, ICE/RICE) — не разворачивай, я их знаю.
- Бэкенд/БД (FK, soft-delete, миграции, индексы, tenant isolation, транзакции) — поясняй назначение одной строкой при первом упоминании в ответе. Не определение из учебника, а зачем оно здесь.
- Прочие технические (JS-рантайм, git, CI, MCP, хуки, агенты, Claude Code) — если без термина никак, дай короткое пояснение в скобках.

**Длина и тон:**
- Коротко и прямо. 1–3 предложения по умолчанию. Развёрнуто — только если сам прошу или если без вариантов не выбрать решение.
- Без подводок «давай разберёмся», «отличный вопрос», без эмодзи, без списков ради списков.
- Сразу ответ или вывод первой строкой. Обоснование — после, если оно вообще нужно.

**Инициатива:**
- Мелкие обратимые правки (один файл, локальный эксперимент, ресёрч по коду) — делай сразу, не спрашивай.
- Перед коммитом, пушем, крупным рефакторингом, изменением скоринга/PAS/схемы данных, добавлением зависимостей — сначала покажи план/диф, дождись «ок».
- Если задача допускает 2+ трактовки и цена ошибки выше пары минут моего времени — задай 1 уточняющий вопрос, не угадывай.

**Когда я переспрашиваю или поправляю:**
- Если переспросил — значит ответ был слишком абстрактный или слишком техничный. Переформулируй ближе к продукту/конкретике, не извиняйся, не повторяй то же другими словами.
- Если поправил факт — прими правку, обнови понимание, не защищай прошлый ответ.
- Если сказал «короче» — следующий ответ должен быть в 2+ раза короче, и так до явного «достаточно».

**Поддержание блока:**
Когда я говорю «запомни», «добавь в блок», «учти на будущее» — дописывай сюда, не в отдельные заметки. Если правило конфликтует с уже записанным — переспроси, какое оставить.

---

## Environment

Приложение полностью клиентское — переменных окружения нет.
Если в будущем появится бэкенд или интеграции, добавить:

```
# (placeholder — сейчас не используются)
# API_KEY=
# BACKEND_URL=
```

---

## What Claude Should Know

**Архитектура — многофайловая, без сборки:**
Приложение разбито на `index.html` (разметка) + `styles.css` (стили) + 12 JS-файлов в `js/`. Нет ES-модулей, нет импортов, нет сборки — все скрипты подключены через обычные `<script src="...">` теги и работают в общей глобальной области видимости. Изменения вносятся в соответствующий файл по назначению (см. Project Structure).

**Состояние — in-memory, без персистентности:**
Данные хранятся в глобальных переменных (`product`, `strategy`, `roadmap`, `history` и др.). При перезагрузке страницы всё сбрасывается — это намеренно (MVP/demo).

**Скоринговая модель (бизнес-логика):**
Функция `scoreHypothesis()` вычисляет 4 параметра (0-5): strategic fit, impact, complexity, confidence. Вердикт определяется по правилам:
- fit ≥ 4 и complexity ≤ 3 → `now`
- fit ≥ 3 → `next`
- fit = 2 → `later`
- иначе → `reject`

**Причинно-следственные цепочки:**
`buildCausalChain()` строит логику: инициатива → поведение → промежуточная метрика → целевая метрика. Слабые звенья фиксируются явно.

**5 стратегических фокусов (AARRR):**
Acquisition, Activation, Retention, Monetization, Infrastructure. Вся система ориентирована вокруг них.

**PAS (Product Architecture Score):**
Составной индекс 0-100 по 5 компонентам (distribution, metric linkage, causal quality, now health, strategic fit avg). Пороги: 70+ зелёный, 45-69 жёлтый, <45 красный.

**AI-фичи — rule-based, не ML:**
`generateSuggestions()`, `runAIOffice()`, `buildCausalChain()` — шаблонная генерация по ключевым словам и категориям продукта. Никакого внешнего AI API нет.

**`pac.html` — редирект:**
Файл содержит только `<meta http-equiv="refresh" content="0; url=index.html">`. Синхронизировать с `index.html` не нужно — изменения вносятся только в соответствующие файлы (`index.html`, `styles.css`, `js/*.js`).

**Навигация по коду:**
Каждый JS-файл отвечает за одну зону. Быстрый поиск функции — по названию файла:
- Скоринг и цепочки → `js/scoring.js`
- Анализ гипотез (UI) → `js/analysis.js`
- Роадмап и история → `js/roadmap.js`
- Стратегия и шаги → `js/strategy.js`
- PAS, алерты, снэпшот → `js/pas.js`
- AI Office → `js/office.js`
- Модалка → `js/modal.js`
- Глобальные переменные → `js/state.js`

**Глобальные функции vs стрелочные:**
Все обработчики кнопок объявлены через `function fn()` — только так они попадают в `window` и доступны из `onclick="fn()"` в HTML. Стрелочные функции `const fn = () =>` в глобальной области в `window` не попадают — использовать только для вспомогательной логики внутри других функций.

**Как расширять "AI" логику:**
Добавление новой категории инициатив или фокуса — это расширение массивов ключевых слов в `scoreHypothesis()` и шаблонов в `generateSuggestions()`. Архитектура рассчитана на добавление `case`/`if` блоков, не на рефакторинг. Новые продуктовые категории добавляются в объект шаблонов по ключу (SaaS B2B, Marketplace, EdTech и т.д.).

---

## Data

> **Статус: целевая модель персистентности, не текущая реализация.**
> Сейчас приложение полностью in-memory (см. «Состояние — in-memory» выше) — БД нет.
> Этот раздел описывает, как сущности легли бы в реляционную БД, если появится бэкенд.
> Решения зафиксированы по итогам уточнений: пользователи без ролей, мультитенантность
> через `Workspace`, общие данные внутри workspace, soft-delete везде, отдельного
> audit-лога нет — только таймштампы и `created_by`.

**Базовые соглашения по всем таблицам:**
- `id` — `uuid`, первичный ключ (исключение: `Initiative.id` — `text`, формат `rm-<ts><rand>` из текущего кода).
- `created_at`, `updated_at` — `timestamptz NOT NULL DEFAULT now()`.
- `archived_at` — `timestamptz NULL`. Soft-delete: запись не удаляется физически, проставляется `archived_at` (и `status` где он есть).
- `workspace_id` — `FK → Workspace.id`, есть почти на всех таблицах, граница тенант-изоляции.
- `created_by` — `FK → User.id`, authorship; ролей нет — все участники workspace равны по правам.

### Workspace

Тенант. Корень изоляции данных — у разных команд/клиентов данные не пересекаются.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `name` | text | NOT NULL | Название команды/тенанта |
| `created_at` | timestamptz | NOT NULL | |
| `updated_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete |

### User

Участник workspace. Ролей нет — разграничение только по принадлежности к workspace.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `workspace_id` | uuid | FK → Workspace.id, NOT NULL | Тенант пользователя |
| `email` | text | UNIQUE, NOT NULL | |
| `name` | text | NOT NULL | |
| `created_at` | timestamptz | NOT NULL | |
| `updated_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete |

### Product

Продукт. **1:1 с Workspace** — один продукт на тенант (`workspace_id` UNIQUE). Поля — из объекта `product` в коде.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `workspace_id` | uuid | FK → Workspace.id, **UNIQUE**, NOT NULL | Связь 1:1 |
| `current_strategy_version_id` | uuid | FK → StrategyVersion.id, NULL | Активная версия стратегии (бывш. глобальная `strategy`) |
| `name` | text | NOT NULL | |
| `category` | enum | NOT NULL | SaaS B2B, Marketplace, EdTech, … (ключи шаблонов скоринга) |
| `description` | text | NOT NULL | Бывш. `product.desc` |
| `value_prop` | text | NULL | Ценностное предложение (бывш. `product.value`) |
| `audience` | text | NOT NULL DEFAULT 'пользователей' | |
| `created_by` | uuid | FK → User.id | |
| `created_at` | timestamptz | NOT NULL | |
| `updated_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete |

### StrategyVersion

Версия стратегии. Накапливаются под продуктом (бывш. массив `strategyVersions`). Активная — та, на которую указывает `Product.current_strategy_version_id`.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `product_id` | uuid | FK → Product.id, NOT NULL | |
| `workspace_id` | uuid | FK → Workspace.id, NOT NULL | Денормализация для тенант-изоляции |
| `version` | int | NOT NULL, UNIQUE(`product_id`, `version`) | Инкремент в рамках продукта |
| `target_metric` | text | NOT NULL | Целевая метрика квартала |
| `baseline_val` | text | NULL | Текущее значение метрики |
| `target_val` | text | NULL | Целевое значение |
| `target_date` | date | NULL | Дедлайн |
| `focus` | enum | NOT NULL | AARRR: Acquisition / Activation / Retention / Monetization / Infrastructure |
| `focus2` | enum | NULL | Вторичный фокус |
| `anti_focus` | enum[] | | Список анти-фокусов (AARRR) |
| `stage` | text | NULL | Стадия продукта |
| `resource` | text | NULL | Напр. «1 команда» |
| `budget` | text | NULL | |
| `tempo` | text | NULL | |
| `dev_cap` | enum | NULL | low / medium / high |
| `status` | enum | NOT NULL DEFAULT 'active' | active / archived |
| `created_by` | uuid | FK → User.id | |
| `created_at` | timestamptz | NOT NULL | Бывш. `strategy.ts` |
| `updated_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete; старые версии архивируются, не удаляются |

### StrategicHypothesis

Стратегическая гипотеза — пункт списка `stratHyps` внутри версии стратегии. В коде это просто строки.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `strategy_version_id` | uuid | FK → StrategyVersion.id, NOT NULL | |
| `workspace_id` | uuid | FK → Workspace.id, NOT NULL | Тенант-изоляция |
| `text` | text | NOT NULL | Формулировка гипотезы |
| `created_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete |

### Initiative

Проанализированная инициатива (карточка роадмапа = элемент истории — в коде это один и тот же объект). Привязана к **конкретной версии стратегии** на момент анализа (бывш. снимок `stratCtx`). Поля скоринга вынесены колонками — связь со скорингом 1:1.

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | text | PK | Формат `rm-<ts><rand>` |
| `workspace_id` | uuid | FK → Workspace.id, NOT NULL | Тенант-изоляция |
| `strategy_version_id` | uuid | FK → StrategyVersion.id, NOT NULL | Версия стратегии на момент анализа (бывш. `stratCtx`) |
| `text` | text | NOT NULL | Описание инициативы/гипотезы |
| `zone` | enum | NOT NULL | Текущее размещение в роадмапе: now / next / later / reject (меняется drag&drop) |
| `verdict` | enum | NOT NULL | Изначальный AI-вердикт: now / next / later / reject |
| `depth` | enum | NOT NULL | quick / standard / deep |
| `score_fit` | int | 0–5 | Strategic fit |
| `score_impact` | int | 0–5 | Impact на target-метрику |
| `score_complexity` | int | 0–5 | Инженерная сложность |
| `score_confidence` | int | 0–5 | Качество гипотезы |
| `is_ai` | bool | NOT NULL DEFAULT false | Сгенерирована AI Office или введена пользователем |
| `status` | enum | NOT NULL DEFAULT 'active' | active / archived |
| `created_by` | uuid | FK → User.id, NULL | NULL у AI-сгенерированных инициатив |
| `created_at` | timestamptz | NOT NULL | Бывш. `ts` |
| `updated_at` | timestamptz | NOT NULL | |
| `archived_at` | timestamptz | NULL | Soft-delete (отдельно от `zone = reject`) |

### CausalChain

Причинно-следственная цепочка инициативы (`buildCausalChain()`). **1:1 с Initiative.**

| Поле | Тип | Ключ / ограничения | Описание |
|---|---|---|---|
| `id` | uuid | PK | |
| `initiative_id` | text | FK → Initiative.id, **UNIQUE**, NOT NULL | Связь 1:1 |
| `workspace_id` | uuid | FK → Workspace.id, NOT NULL | Тенант-изоляция |
| `action` | text | | Тип инициативы (инициатива) |
| `behaviour` | text | | Прогноз изменения поведения |
| `inter_metric` | text | | Промежуточная метрика |
| `target_metric` | text | | Целевая метрика |
| `gap_text` | text | | Описание логического разрыва в цепочке |
| `weak_links` | text[] | | Явно зафиксированные слабые звенья |
| `created_at` | timestamptz | NOT NULL | |

### Связи между таблицами

```
   ┌───────────────┐
   │   Workspace   │   тенант — граница изоляции данных
   └───┬───────┬───┘
       │ 1:N   │ 1:1
       ▼       ▼
 ┌────────┐  ┌───────────┐
 │  User  │  │  Product  │── current_strategy_version_id ──┐
 └────────┘  └─────┬─────┘   (1:1, активная версия)        │
                   │ 1:N                                   │
                   ▼                                       │
            ┌──────────────────┐ ◄───────────────────────-─┘
            │ StrategyVersion  │
            └────────┬─────────┘
            1:N      │      1:N
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────────┐   ┌────────────┐
│ StrategicHypothesis  │   │ Initiative │
└──────────────────────┘   └─────┬──────┘
                                 │ 1:1
                                 ▼
                          ┌─────────────┐
                          │ CausalChain │
                          └─────────────┘

Сквозные FK (не показаны стрелками, чтобы не загромождать схему):
  • workspace_id → Workspace  — на User, Product, StrategyVersion,
    StrategicHypothesis, Initiative, CausalChain (тенант-изоляция)
  • created_by   → User       — на Product, StrategyVersion, Initiative
    (authorship; NULL у AI-сгенерированных Initiative)

Cardinality:
  Workspace 1───1 Product            Workspace 1───N User
  Product   1───N StrategyVersion    Product   1───1 StrategyVersion (current_*)
  StrategyVersion 1───N StrategicHypothesis
  StrategyVersion 1───N Initiative   Initiative 1───1 CausalChain
```

---

## Визуальный спек — ASCII-схемы

### В документации
При создании или обновлении любого .md-файла добавляй ASCII-схемы в разделах, где визуал помогает схватить суть быстрее текста:
- Архитектура → блоки сервисов и стрелки с подписями протоколов
- Структура проекта → дерево папок с пояснениями
- User flow → экраны и переходы со стрелками
- UI-макет → блоки страницы с подписями и примерами данных
- Связи компонентов → блоки и стрелки импортов

Схемы — в ``` блок, текст раздела не переписывай, только дополняй.

### Перед новым функционалом (до кода)
Если задача — добавить новый экран, модуль или интеграцию: сначала нарисуй ASCII-схему (UI-вайрфрейм, архитектура, user flow или связи компонентов). Покажи мне, дождись подтверждения и только потом пиши код.

---

## Don't

1. **Не добавляй внешние зависимости и build-систему** (webpack, vite, npm-пакеты) без явного запроса — вся ценность проекта в отсутствии этого усложнения.

2. **Не вставляй user input в DOM без `esc(s)`** — это единственная защита от XSS в клиентском приложении. Касается не только форм, но и `renderHistory()`, `renderRoadmap()`, модалки и снэпшота — текст гипотезы попадает везде.

3. **Не объединяй JS-файлы обратно в `index.html`** — приложение намеренно разбито на модули в `js/`. Не переносить логику обратно в HTML-файл без явного запроса.

4. **Не добавляй localStorage/sessionStorage-персистентность** по умолчанию — потеря состояния при рефреше является ожидаемым поведением в текущей итерации.

5. **Не меняй скоринговые веса и пороги** (`scoreHypothesis`, `updatePAS`) без понимания бизнес-логики — это ядро продукта.

6. **Не переименовывай глобальные функции без обновления всех `onclick=` в HTML** — JS не выдаст ошибку компиляции, кнопка просто молча перестанет работать. Пример: переименовать `analyzeHyp()` → функция не вызывается, но консоль молчит.

7. **Не меняй русские ключевые слова в UI-подсказках и плейсхолдерах без правки scoring-логики** — confidence, fit и другие параметры вычисляются через поиск русских подстрок в тексте гипотезы (`потому что`, `за счёт`, `это приведёт`). Смена формулировок незаметно ломает скоринг.

8. **Не добавляй реальные async-операции (`await fetch`) в функции, вызываемые из `onclick`** — текущий "анализ" намеренно имитирует задержку через `setTimeout`. Смешение с настоящим async нарушит порядок обновления UI и управление spinner-ом.

9. **Не трогай `pac.html`** — файл содержит только редирект на `index.html`. Синхронизировать с `index.html` не нужно. Не удалять без явного подтверждения — URL `/pac.html` может быть активен.
