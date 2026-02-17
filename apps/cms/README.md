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

## Миграция данных

После создания API-токена запустите скрипт миграции:

```bash
cd scripts
npm install
npm run migrate
```

## Структура контента

### Collection Types

- **Tag** - теги для новостей
- **News Article** - новостные статьи
- **Service Category** - категории услуг
- **Service** - услуги
- **Person** - команда и эксперты

### Компоненты

**Shared:**
- `text-item` - текстовый элемент для списков
- `call-to-action` - CTA кнопка

**Service:**
- `service-facts` - факты об услуге
- `methodology-item` - элемент методологии
- `service-example` - пример услуги
- `product-item` - продукт в рамках услуги

**Person:**
- `team-info` - информация о позиции в команде
- `expert-profile` - профиль эксперта
- `expert-metrics` - метрики эксперта

## API Endpoints

После настройки прав доступа:

```
GET /api/tags
GET /api/news-articles
GET /api/news-articles/:documentId
GET /api/service-categories?populate=services
GET /api/services
GET /api/people
```

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
