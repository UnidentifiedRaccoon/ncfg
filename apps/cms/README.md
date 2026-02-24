# NCFG Strapi CMS

Headless CMS для управления контентом сайта НЦФГ.

## Быстрый старт

### 1. Установка зависимостей

```bash
cd apps/cms
npm install
cp .env.example .env
```

Заполните все обязательные переменные в `apps/cms/.env` до запуска CMS.

### 2. Запуск в режиме разработки

```bash
npm run develop
```

CMS будет доступна по адресу: http://localhost:1337

### 3. Первоначальная настройка

1. Откройте http://localhost:1337/admin
2. Создайте администратора (email, пароль)
3. Перейдите в Settings → API Tokens
4. Создайте новый токен с правами на чтение (Read)
5. Скопируйте токен в `scripts/.env` и `web/.env.local`

## Скрипты обслуживания контента

Legacy-скрипты миграции удалены. Для проверки/починки медиа используйте:

```bash
cd scripts
npm install
npm run media:check
```

### Миграция рекомендаций из кода в Strapi

Для первичного переноса рекомендаций из legacy-данных кода в новый collection type:

```bash
cd apps/cms
npm run migrate:recommendations
```

Скрипт идемпотентный: повторный запуск обновляет записи по `slug` и не создает дубликаты.

## Синхронизация прода в локальную БД Strapi

Добавлен скрипт `scripts/sync-prod-to-local.sh`, который:
- делает бэкап локальной БД (опционально);
- забирает продовые секреты из Yandex Lockbox;
- выполняет `strapi export` из продовой БД;
- выполняет `strapi import` в локальную БД;
- запускает короткую проверку по `news-article`.

Запуск:

```bash
cd apps/cms
npm run sync:prod-to-local
```

Требования:
- установлен и настроен `yc` CLI (доступ к Lockbox);
- локальный Strapi на `:1337` должен быть остановлен перед запуском скрипта.

Полезные опции:

```bash
cd apps/cms
bash scripts/sync-prod-to-local.sh --help
```

## Структура контента

### Collection Types

- **Blog Category** - рубрики/категории для новостей
- **News Article** - новостные статьи
- **Service Category** - категории услуг
- **Service** - услуги
- **Person** - команда и эксперты
- **Recommendation** - рекомендации партнеров и клиентов

### Single Types

- **Team Configuration** - конфигурация связи команды (`team-config`)
- **Experts Configuration** - конфигурация связи экспертов (`expert-config`)

Legacy single types для страниц/настроек (`about-page`, `blog-page`, `companies-page`, `home-page`, `individuals-page`, `site-setting`) удалены из CMS.
Страницы и site settings на фронтенде берутся из JSON-источников в `apps/web`.

### Компоненты

**Shared:**
- `text-item` - текстовый элемент для списков
- `call-to-action` - CTA-кнопка

**Service:**
- `service-example` - пример услуги

## API Endpoints

После настройки прав доступа:

``` 
GET /api/blog-categories
GET /api/news-articles
GET /api/news-articles/:documentId
GET /api/service-categories?populate=services
GET /api/services
GET /api/people
GET /api/recommendations
GET /api/team-config
GET /api/expert-config
```

## Rollout (рекомендуемый порядок)

1. Деплой CMS со схемой `recommendation`.
2. Выполнение `npm run migrate:recommendations` в целевой среде.
3. Проверка чтения `GET /api/recommendations` токеном фронтенда.
4. Деплой фронтенда, который читает рекомендации из Strapi.

## Переменные окружения

```env
# Server
HOST=0.0.0.0
PORT=1337

# Database (required for develop/build/start)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ncfg_cms
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=replace-with-password
DATABASE_SSL=false

# Secrets (required for develop/build/start)
APP_KEYS=replace-with-key-1,replace-with-key-2
API_TOKEN_SALT=replace-with-api-token-salt
ADMIN_JWT_SECRET=replace-with-admin-jwt-secret
TRANSFER_TOKEN_SALT=replace-with-transfer-token-salt
JWT_SECRET=replace-with-jwt-secret

# Uploads (S3 / Yandex Object Storage, required for develop/build/start)
AWS_BUCKET=ncfg-uploads-1770291983
AWS_ACCESS_KEY_ID=replace-with-access-key-id
AWS_SECRET_ACCESS_KEY=replace-with-secret-access-key
AWS_REGION=ru-central1
AWS_ENDPOINT=https://storage.yandexcloud.net
```

Во всех режимах (`npm run develop`, `npm run build`, `npm run start`) выполняется строгая fail-fast валидация: если любой обязательный ключ пустой или отсутствует, команда завершится с ошибкой.

## Продакшен

Для продакшена рекомендуется:
- Использовать PostgreSQL вместо SQLite
- Настроить S3/Object Storage для медиафайлов
- Изменить все секретные ключи
- Настроить CORS для продакшен-домена
