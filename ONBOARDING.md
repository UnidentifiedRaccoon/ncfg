# Onboarding: от clone до PR (Web)

Это пошаговое руководство для нового разработчика.  
Цель: пройти полный цикл работы с `apps/web` от клонирования репозитория до создания Pull Request.

## Что вы получите после прохождения

После этого гайда вы сможете:
- клонировать репозиторий;
- установить зависимости;
- создать отдельную feature-ветку по правилам проекта;
- запустить web c подключением к продовому Strapi (`STRAPI_SOURCE=prod`);
- внести изменения, проверить их локально;
- сделать commit, push и создать PR.

## 1. Предварительные требования

Нужно заранее иметь:
- `git`;
- `node` версии `20-22` и `npm` версии `10+`;
- доступ к репозиторию `git@github.com:UnidentifiedRaccoon/ncfg.git`;
- read-only токен Strapi для прода (`STRAPI_PROD_API_TOKEN`);
- опционально: `gh` (GitHub CLI) для создания PR из терминала.

Проверка версий:

```bash
node -v
npm -v
git --version
```

## 2. Клонирование репозитория

Основной способ (SSH):

```bash
git clone git@github.com:UnidentifiedRaccoon/ncfg.git
cd ncfg
```

Fallback (HTTPS):

```bash
git clone https://github.com/UnidentifiedRaccoon/ncfg.git
cd ncfg
```

## 3. Установка зависимостей

Основной путь для работы с web:

```bash
cd /Users/yura-posledov/cursor/ncfg/apps/web
npm ci
```

Опционально, если будете менять CMS или служебные скрипты:

```bash
cd /Users/yura-posledov/cursor/ncfg/apps/cms
npm ci

cd /Users/yura-posledov/cursor/ncfg/scripts
npm ci
```

## 4. Настройка web для подключения к продовому Strapi

Скрипт `npm run dev:prod` запускает web c `STRAPI_SOURCE=prod`.  
Создайте локальный env-файл на основе примера:

```bash
cd /Users/yura-posledov/cursor/ncfg/apps/web
cp .env.local.example .env.local
```

Заполните в `apps/web/.env.local` обязательные переменные:

```env
STRAPI_PROD_URL=https://admin.ncfg.ru
STRAPI_PROD_API_TOKEN=<read-only token>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Важно по безопасности:
- не коммитьте `.env.local`;
- не передавайте токен в PR, issue, чатах и логах.

## 5. Запуск web в режиме prod-source

```bash
cd /Users/yura-posledov/cursor/ncfg/apps/web
npm run dev:prod
```

Проверьте:
- страница открывается на `http://localhost:3000`;
- health endpoint отвечает:

```bash
curl http://localhost:3000/api/health
```

Ожидаемый результат: JSON со `status: "ok"`.

## 6. Создание feature-ветки по правилам проекта

Перед началом работы обновите `main`:

```bash
cd /Users/yura-posledov/cursor/ncfg
git checkout main
git pull
```

Создайте ветку:

```bash
git checkout -b <type>/<short-kebab-case>
```

Опционально с тикетом:

```bash
git checkout -b <type>/<ticket>-<short-kebab-case>
```

Примеры:
- `feat/onboarding-guide`
- `fix/NCFG-132-auth-magic-link`

Допустимые `type`: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `style`, `build`, `ci`, `chore`.

## 7. Внесение изменений и локальная проверка

Сделайте изменения в `apps/web`, затем выполните минимум:

```bash
cd /Users/yura-posledov/cursor/ncfg/apps/web
npm run lint
```

Если меняли критичную логику данных/рендеринга, дополнительно:

```bash
npm run build
```

## 8. Коммит (Conventional Commits)

Добавьте изменения:

```bash
cd /Users/yura-posledov/cursor/ncfg
git add <измененные_файлы>
```

Сделайте commit в формате:

```bash
git commit -m "<type>(scope): <description>"
```

Рекомендуемые `scope` для этого проекта:
- `app`, `ui`, `components`, `pages`, `routes`;
- `api`, `server`, `db`;
- `auth`, `payments`, `analytics`;
- `config`, `deps`, `ci`.

Пример:

```bash
git commit -m "feat(ui): add onboarding callout section"
```

## 9. Push и создание PR

Отправьте ветку:

```bash
cd /Users/yura-posledov/cursor/ncfg
git push -u origin HEAD
```

Создайте PR через GitHub CLI:

```bash
gh pr create --base main
```

Если `gh` не установлен, создайте PR через GitHub UI (в браузере).

Требования к PR:
- заголовок в формате Conventional Commits (`<type>(scope): <summary>`);
- тело по шаблону: `.github/pull_request_template.md`;
- один PR = одна логическая задача.

## 10. Финальный чеклист перед отправкой PR

- [ ] Ветка названа по правилам (`<type>/<short-kebab-case>`).
- [ ] Web запускается через `npm run dev:prod`.
- [ ] Локально пройдено `npm run lint`.
- [ ] При необходимости пройдено `npm run build`.
- [ ] Commit и PR оформлены по Conventional Commits.
- [ ] В PR нет секретов, токенов и лишних файлов.

## Приложение: базовый flow в одном блоке

```bash
# 1) Подготовка
git clone git@github.com:UnidentifiedRaccoon/ncfg.git
cd ncfg
cd apps/web && npm ci
cp .env.local.example .env.local

# 2) Старт web с продовым Strapi
npm run dev:prod

# 3) Работа в отдельной ветке
cd /Users/yura-posledov/cursor/ncfg
git checkout main && git pull
git checkout -b feat/my-change

# ... изменить код ...

# 4) Проверка + commit + push
cd apps/web && npm run lint
cd /Users/yura-posledov/cursor/ncfg
git add <files>
git commit -m "feat(ui): describe change"
git push -u origin HEAD

# 5) PR
gh pr create --base main
```
