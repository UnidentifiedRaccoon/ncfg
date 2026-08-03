# Локальная разработка NCFG

## Быстрый старт

Для обычной разработки сайта из корня репозитория нужна одна команда:

```bash
npm run dev
```

Она запускает Next.js frontend и `app/api` backend, получает read-only токен
production Strapi из Yandex Lockbox только в память процесса и проверяет две
точки готовности: `/api/health` и `/api/health/strapi`.

Первичная настройка Yandex Cloud выполняется один раз:

```bash
yc init
```

## Профили

| Задача | Команда | Что запускается |
|---|---|---|
| Обычная разработка сайта | `npm run dev` | Next.js + `app/api`, production Strapi read-only |
| Только локальная CMS | `npm run dev:cms` | PostgreSQL + MinIO + Strapi с HMR |
| Полностью локальный стек | `npm run dev:full` | PostgreSQL + MinIO + Strapi + Next.js |
| Диагностика окружения | `npm run dev:doctor` | Только проверки, без запуска сервисов |
| Readiness уже запущенных сервисов | `npm run dev:verify` | HTTP smoke-check без lint/build |
| Остановка | `npm run dev:down` | Owned-процессы и Compose; volumes сохраняются |

`dev:full` создаёт временные local-only read/write токены в памяти. В базе
хранятся только их хэши; записи удаляются при штатной остановке и в любом
случае истекают через 24 часа. Синхронизация production-базы не выполняется.

## Что launcher делает автоматически

- проверяет Node `>=22.22.2 <23` и npm `>=10`;
- сохраняет текущую ветку и dirty worktree без `git pull` и переключений;
- запускает `npm ci --no-audit --no-fund` только при отсутствии зависимостей
  или изменении `package.json`/`package-lock.json`;
- для `dev` получает только `ncfg-dev-secrets/STRAPI_PROD_API_TOKEN`;
- для CMS-профилей поднимает Docker daemon через Colima на macOS, если это нужно;
- слушает локальные сервисы только на loopback-интерфейсе;
- префиксует логи, редактирует известные токены и корректно завершает дочерние процессы.

## Защита production

В обычном `npm run dev` принудительно установлены:

```text
STRAPI_WRITE_MODE=disabled
OUTBOUND_MODE=disabled
```

Поэтому локальный Next.js не пишет в production Strapi, не отправляет реальные
письма и не создаёт заявки в GetCourse/Bitrix24, даже если Next.js найдёт такие
credentials в локальном env-файле. Production write-token launcher не запрашивает.

В `dev:full` разрешены записи только в локальный Strapi. Почта и CRM остаются
выключенными, чтобы тестовые формы не создавали реальные внешние эффекты.

Production workflow включает эффекты явно. Публичный PR preview, наоборот,
не получает Strapi write-token и запускается с обоими режимами `disabled`.

## Readiness и troubleshooting

Успешный запуск заканчивается строкой `READY`. После неё повторный build, lint,
browser QA или ручной curl для подтверждения инфраструктуры не нужны.

Если запуск завершился ошибкой:

```bash
npm run dev:doctor
```

Частые причины:

- `yc` не авторизован — выполните `yc init`;
- нет доступа к Lockbox — нужна роль `lockbox.payloadViewer` на
  `ncfg-dev-secrets`;
- порт `3000` или `1337` занят чужим процессом — launcher ничего не завершает
  по номеру порта;
- Docker-профиль не стартует — проверьте Docker Desktop или Colima.

Проверки кода выполняются отдельно от запуска, в каталоге изменённого приложения:

```bash
cd apps/web
npm test
npm run lint
npx --no-install tsc --noEmit
```

```bash
cd apps/cms
npx --no-install tsc --noEmit
```

Launcher не читает и не создаёт `.env*`. Production payload нельзя сохранять в
env-файлы, логи, issue, PR или чат.
