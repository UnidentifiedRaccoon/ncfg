# Локальная разработка NCFG

## Быстрый старт

Для обычной разработки сайта из корня репозитория нужна одна команда:

```bash
npm run dev
```

Она запускает Next.js frontend и `app/api` backend, получает read-only токен
production Strapi из Cloud.ru Secret Management только в память процесса и проверяет две
точки готовности: `/api/health` и `/api/health/strapi`.

Первичная настройка: выделенный сервисный аккаунт `ncfg-dev-reader` получает
роль `scsm.user` только на секрет `ncfg/development`. Его ключ доступа хранится
в macOS Keychain, сервис `ncfg-cloudru-dev-reader`, как JSON с полями `keyId` и
`secret`. Значения не добавляйте в репозиторий, env-файлы или команды в истории shell.
На других системах передайте `NCFG_CLOUDRU_KEY_ID` и `NCFG_CLOUDRU_KEY_SECRET`
через защищённое окружение launcher; дочерние процессы их не получают.

По умолчанию закреплена версия `1` секрета. При ротации укажите проверенную версию:

```bash
NCFG_CLOUDRU_DEV_VERSION=2 npm run dev
```

Секрет разработки должен содержать только `STRAPI_PROD_API_TOKEN` с правами
чтения. Production-секреты web/CMS этому аккаунту недоступны. Настройки `yc`
для launcher больше не используются.

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
- для `dev` получает только `ncfg/development` → `STRAPI_PROD_API_TOKEN`;
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

- нет доступа к Secret Management — проверьте выделенный аккаунт `ncfg-dev-reader`
  с ролью `scsm.user` только на секрет `ncfg/development`;
- на macOS bootstrap-ключ читается из Keychain (service `ncfg-cloudru-dev-reader`),
  запись содержит JSON с полями `keyId` и `secret`; значения не выводятся;
- на других системах передайте `NCFG_CLOUDRU_KEY_ID` и `NCFG_CLOUDRU_KEY_SECRET`
  через защищённое хранилище окружения. Не записывайте их в `.env` или Git;
- проект, путь и закреплённую версию можно задать через `NCFG_CLOUDRU_PROJECT_ID`,
  `NCFG_CLOUDRU_DEV_SECRET`, `NCFG_CLOUDRU_DEV_VERSION`. По умолчанию используются
  проект NCFG, `ncfg/development`, версия `1`. Новая версия требует явного выбора;
- ошибка Cloud.ru не вызывает скрытого обращения в Yandex Lockbox. Явно заданный
  `STRAPI_PROD_API_TOKEN` поддерживается и не требует получения bootstrap-ключа;
- порт `3000` или `1337` занят чужим процессом — launcher ничего не завершает
  по номеру порта;
- Docker-профиль не стартует — проверьте Docker Desktop или Colima.

Если Turbopack повторно зависает или расходует много памяти после переноса
маршрутов, можно выбрать Webpack только для текущей dev-сессии:

```bash
npm run dev:down
NCFG_YC_PROFILE=default NCFG_DEV_BUNDLER=webpack npm run dev
```

`NCFG_DEV_BUNDLER` принимает `turbopack` (по умолчанию) или `webpack`.
Профиль Strapi, отключение внешних эффектов и readiness остаются прежними.
Переменная не меняет production-сборку.

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
