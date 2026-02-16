# refactoring.md

## 1) Цель документа

Цель документа — дать детальный план рефакторинга проекта `ncfg`, который можно передавать нескольким агентам для параллельной, предсказуемой и контролируемой реализации.

## 2) Правила и исходные ограничения

- Базовые правила разработки берутся из:
  - `/Users/yura-posledov/cursor/ncfg/ENGINEERING.md`
  - `/Users/yura-posledov/cursor/ncfg/CLAUDE.md`
  - `/Users/yura-posledov/cursor/ncfg/.claude/rules/*.md`
- Приоритет — поддерживаем поведение приложения, уменьшая технический долг и повышая архитектурную определённость.
- Изменения делаются поэтапно, с минимизацией регрессий.

## 3) Ключевые выводы анализа

### 3.1. Структурные наблюдения
- Проект фактически разделён на:
  - `apps/web` — основное Next.js приложение.
  - `apps/cms` — headless CMS на Strapi.
  - `web/` — legacy зона (требует решения: удалить/архивировать/мигрировать).
- На практике FSD-структура частичная: `entities` есть, но `features` и слой использования ещё не закрывают все сценарии.

### 3.2. Критические узкие места
1. `apps/web/shared/api/data-provider.ts` содержит слишком много обязанностей:
   - оркестрация запросов
   - fallback-логика
   - трансформация/маппинг
   - частичная валидация поведения при ошибках
2. Поведение fallback и ошибки смешаны внутри доменных методов, что усложняет поддержку и тестирование.
3. Есть риск контрактного дрейфа данных между CMS и frontend-слоем (наиболее заметно в связях команды/людей).
4. Большие UI-файлы в `apps/web/widgets` смешивают отображение и бизнес-логику (валидации форм, фильтрации, маппинг и условия рендера).
5. API маршруты `/api/lead` и `/api/question` функционально работают, но имеют минимальную наблюдаемость и не полностью формализуют контракты ошибок.

### 3.3. Архитектурные риски
- Высокая связанность между слоями.
- Дублирование логики между страницами и виджетами.
- Неявные wildcard-экспорты и слабая граница публичного API модулей.
- Неочевидный статус legacy-папки `web/`.

## 4) Целевое состояние после рефакторинга

1. Разделение слоя данных на: `source -> adapter -> domain service -> feature`
2. Явная контрактная модель Strapi/Domain с валидируемыми мапперами.
3. Более строгие feature-срезы для страниц и сценариев.
4. UI-компоненты с разделением контейнерной и презентационной логики.
5. API endpoints с единым форматом ошибок, requestId и лимитами устойчивости.
6. Согласованный статус `web/` (исключить из активного пути, если не нужен).

## 5) Детальный план по зонам

## 5.1 Пакет A — Data foundation и контракты

**Цель:** убрать монолитность `data-provider`, ввести явный слой маппинга и централизованные политики ошибок/fallback.

### Обязательные шаги
1. Разделить `apps/web/shared/api/data-provider.ts` на:
   - источники данных (`source`)
   - мапперы (`adapters`)
   - orchestration (`services`/`use-cases`)
2. Перенести fallback-решения в одну понятную политику (когда и почему fallback возможен).
3. Явно типизировать контракт входа Strapi (DTO) и доменную модель UI.
4. Свести к единообразным экспортам модуль API.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/data-provider.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/news.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/services.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/people.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/site-settings.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/lib/strapi.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/shared/api/types/strapi.ts`

### Реализовано (2026-02-15)
- `apps/web/shared/api/data-provider.ts` стал фасадом с публичными экспортами без изменения имён.
- Код разложен по модулям в `apps/web/shared/api/data-provider/`: `news.ts`, `services.ts`, `pages.ts`, `service-ui.ts`, `people.ts`, плюс общие утилиты `env.ts`, `utils.ts`, `fallback-meta.ts`.
- Поведение fallback сохранено: Strapi предпочитается, при ошибках/нехватке env используется статический контент из `public/content/*`.
- Запускалось локально: `pnpm -C apps/web lint`, `pnpm -C apps/web build` (при выключенной Strapi возможен `fetch failed`/`ECONNREFUSED` в логах во время SSG, но сборка завершается).

---

## 5.2 Пакет B — CMS contract consistency

**Цель:** снять риск расхождений схем между CMS и фронтом.

### Обязательные шаги
1. Зафиксировать критические связи и их имена (`teamGroup`, `expertGroup` и др.).
2. Ввести единый реестр сущностей и ожидаемых полей.
3. Добавить compatibility-слой при необходимости, чтобы избежать резких изменений внешнего поведения.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/apps/cms/src/api/person/content-types/person/schema.json`
- `/Users/yura-posledov/cursor/ncfg/apps/cms/src/api/team-config/content-types/team-config/schema.json`
- `/Users/yura-posledov/cursor/ncfg/apps/cms/src/api/expert-config/content-types/expert-config/schema.json`

### Важные детали (зафиксировано при выполнении)
- В актуальной Strapi-схеме связь у `person` называется `teamGroup` (manyToOne на `team-config`), а не `team`.
- На фронте нужно использовать `teamGroup` в `populate`/`filters`, но держать compatibility-алиас для старого поля `team` там, где есть legacy/скрипты миграции.

---

## 5.3 Пакет C — Структура страниц и feature-срезы

**Цель:** убрать повтор логики в `app` и сделать страницы thin-компонентами.

### Обязательные шаги
1. Ввести `features` для ключевых зон (`about`, `blog`, `companies`, `individuals`, `services`, `site`).
2. Перенести повторяющиеся трансформации данных из `app` в feature-слой.
3. Страницы строить как композицию: `use-case + UI`.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/about/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/companies/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/companies/[slug]/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/individuals/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/blog/page.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/blog/[slug]/page.tsx`

### Реализовано (2026-02-15)
- Добавлен слой `apps/web/features/*` (use-case/model функции для страниц).
  - `home`, `about`, `companies`, `individuals`, `blog`, `blog-post`, `services`
- Перенесены повторяющиеся трансформации данных из `app/*`:
  - `makeFooterData` в `apps/web/shared/lib/footer-data.ts` (единый маппинг `siteSetting -> Footer.data`)
  - `makeHeroMetrics` в `apps/web/shared/lib/hero-metrics.ts` (метрики hero по ключам)
  - `mapOrderedFaqItems` в `apps/web/shared/lib/faq.ts` (FAQ сортировка по `order` + маппинг)
- Страницы `app/*` переведены на модели из `features/*` (страницы стали тоньше).

---

## 5.4 Пакет D — Декомпозиция крупных виджетов

**Цель:** снизить размер и когнитивную нагрузку UI.

### Обязательные шаги
1. Разбить `Footer` на композиционные блоки с отдельными типами props.
2. Разделить `Team` на `TeamContainer`, `TeamList`, `TeamItem`, отдельный sorter/util.
3. Вынести общие UI/валидационные утилиты форм в shared/features слой.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/Footer.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/Team.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Partners/Partners.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/LeadForm.tsx`
- `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Post/PostQuestionForm.tsx`

### Реализовано (2026-02-15)
- `Footer` разложен на композиционные блоки:
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/FooterBackdrop.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/FooterCta.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/FooterColumns.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/FooterCopyright.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/footer-theme.ts`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Footer/navigation.ts`
- `Team` разложен на `TeamContainer`, `TeamList`, `TeamItem` + отдельные `types`/`utils`:
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/TeamContainer.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/TeamList.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/TeamItem.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/types.ts`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Team/team-utils.ts`
- `LeadForm` разложен на композиционные блоки + вынесены константы:
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/LeadFormForm.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/LeadFormSuccess.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/LeadFormCard.tsx`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/constants.ts`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/LeadForm/types.ts`
- Общие UI/валидационные утилиты форм вынесены в `shared`:
  - `/Users/yura-posledov/cursor/ncfg/apps/web/shared/lib/forms.ts`
  - `/Users/yura-posledov/cursor/ncfg/apps/web/shared/ui/FormFieldLabel.tsx`
- `PostQuestionForm` переведён на общие утилиты форм:
  - `/Users/yura-posledov/cursor/ncfg/apps/web/widgets/Post/PostQuestionForm.tsx`

---

## 5.5 Пакет E — API reliability

**Цель:** сделать API endpoints предсказуемыми и наблюдаемыми.

### Обязательные шаги
1. Формализовать валидаторы для `/api/lead` и `/api/question`.
2. Вернуть единую схему ошибок и `requestId`.
3. Добавить защиту от перегруза/злоупотребления (минимальный rate cap).
4. Подготовить слой интеграций (CRM/email/queue) за интерфейсом.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/api/lead/route.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/api/question/route.ts`
- `/Users/yura-posledov/cursor/ncfg/apps/web/app/api/health/route.ts`

### Реализовано (2026-02-15)
- Добавлен `requestId`: поле в JSON и заголовок `x-request-id` для `/api/lead` и `/api/question`.
- Единый формат ошибок (backward-compatible для UI): `error` как строка + `code` + `fields?` + `requestId` + `success: false`.
- Валидация payload на сервере: типы полей, обязательность, лимиты длины, формат email.
- Минимальный rate cap per-IP: `10` запросов за `60s` на endpoint + заголовки `x-ratelimit-*` и `retry-after` при `429`.
- Уточнены типы заголовков: `buildRateLimitHeaders()` возвращает `Record<string, string>`, чтобы `NextResponse.json(..., { headers })` проходил TS-проверку.
- Подготовлен слой интеграций за интерфейсом: `ContactSink` в `apps/web/shared/lib/contact-sink.ts` (по умолчанию console sink).

---

## 5.6 Пакет F — Legacy и governance

**Цель:** закрыть технический долг и зафиксировать итоговое состояние.

### Обязательные шаги
1. Принять решение по `/Users/yura-posledov/cursor/ncfg/web`:
   - удалить
   - архивировать
   - или явно маркнуть как legacy и исключить из активного пайплайна
2. Перевести экспортный слой с wildcard на управляемые barrel-ы там, где это повышает читаемость.
3. Обновить документацию с новым целевым состоянием.

### Ключевые файлы
- `/Users/yura-posledov/cursor/ncfg/web/*`
- `/Users/yura-posledov/cursor/ncfg/ENGINEERING.md`
- `/Users/yura-posledov/cursor/ncfg/apps/web/ARCHITECTURE.md`

## 6) Рекомендуемая модель запуска с несколькими агентами

- Agent A: Data foundation (`apps/web/shared/api`, `apps/web/shared/lib`)
- Agent B: CMS contract (`apps/cms`)
- Agent C: Features/страницы (`apps/web/app` + новые `features`)
- Agent D: Widgets (`apps/web/widgets`)
- Agent E: API reliability (`apps/web/app/api`)
- Agent F: Legacy/docs/governance (`web/`, docs)

Рекомендуется запускать параллельно с чёткой матрицей «owner files» на каждый пакет и обязательным согласованием публичных контрактов между A и B.

## 7) Риски и меры

1. **Риск регресии data layer** — mitigates: фасадный слой + поэтапный merge.
2. **Риск контентного срыва из-за schema drift** — mitigates: контрактный слой и compatibility adapter.
3. **Риск конфликтов между агентами** — mitigates: ownership файлов и точка сводки API контрактов.
4. **Риск незакрытого legacy** — mitigates: отдельный пакет F с принятым финальным решением.

## 8) Definition of Done

1. Проект собирается в `/Users/yura-posledov/cursor/ncfg/apps/web` и `/Users/yura-posledov/cursor/ncfg/apps/cms`.
2. Ключевые страницы рендерятся стабильно: `/`, `/about`, `/companies`, `/companies/[slug]`, `/individuals`, `/blog`, `/blog/[slug]`.
3. Контрактная модель команда/эксперты согласована между CMS и web.
4. API `/api/lead` и `/api/question` отдают единый формат ошибок и requestId.
5. Принято и зафиксировано решение по legacy `web/`.

## 9) Короткий план статусов для выполнения

- [x] `done`: Начать Пакет A (Data foundation) с разложением `apps/web/shared/api/data-provider.ts`.
- [x] `done`: Начать Пакет B (CMS контракт) и зафиксировать `teamGroup`/`expertGroup` (+ compatibility для legacy `team`).
- [x] `done`: Начать Пакет C (features для страниц) и убрать дублированную трансформацию в `app`.
- [x] `done`: Начать Пакет D (декомпозиция widgets) для `Footer`, `Team`, `LeadForm`.
- [x] `done`: Начать Пакет E (API reliability) для `/api/lead` и `/api/question`.
