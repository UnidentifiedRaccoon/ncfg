# Onboarding: от clone до PR (Web-only)

Это пошаговое руководство для нового разработчика.
Цель: пройти полный цикл работы с `apps/web` от клонирования репозитория до создания Pull Request без локальной настройки CMS.

## Что вы получите после прохождения

После этого гайда вы сможете:
- клонировать репозиторий;
- установить зависимости для `apps/web`;
- авторизоваться в Yandex Cloud и получить ключ Strapi из Lockbox;
- запустить web с подключением к продовому Strapi (`STRAPI_SOURCE=prod`);
- внести изменения, проверить их локально;
- сделать commit, push и создать PR.

## Важно для владельцев инфраструктуры (до мержа этого онбординга)

В секрете `ncfg-dev-secrets` должен существовать ключ `STRAPI_PROD_API_TOKEN`.

Минимальная проверка:
1. Ключ `STRAPI_PROD_API_TOKEN` добавлен в `ncfg-dev-secrets`.
2. Группа `developers` имеет роль `lockbox.payloadViewer` на `ncfg-dev-secrets`.
3. Новый аккаунт разработчика из группы `developers` может прочитать этот ключ через `yc lockbox payload get`.

## 1. Предварительные требования

Нужно заранее иметь:
- `git`;
- `node` версии `20-22` и `npm` версии `10+`;
- установленный `yc` CLI;
- доступ к репозиторию `git@github.com:UnidentifiedRaccoon/ncfg.git`;
- доступ к Yandex Cloud с аккаунтом, который входит в группу `developers`;
- опционально: `gh` (GitHub CLI) для создания PR из терминала.

### 1.1 Установка `git`

macOS (любой один вариант):

```bash
xcode-select --install
```

```bash
brew install git
```

Ubuntu / Debian:

```bash
sudo apt update
sudo apt install -y git
```

### 1.2 Установка `node` и `npm` (через `nvm`)

Рекомендуемый путь для macOS и Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 22
nvm alias default 22
```

Если shell уже был открыт до установки `nvm`, перезапустите терминал или загрузите профиль вручную.

### 1.3 Установка `yc` CLI

macOS (через Homebrew):

```bash
brew install --cask yandex-cloud-cli
```

macOS / Linux (официальный установщик):

```bash
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
```

После установки перезапустите терминал.

### 1.4 Установка на Windows (`winget` + PowerShell)

Установите `git` и `node` через `winget`:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Установите `yc` через официальный PowerShell-скрипт Yandex Cloud:

```powershell
iex (New-Object System.Net.WebClient).DownloadString('https://storage.yandexcloud.net/yandexcloud-yc/install.ps1')
```

После установки закройте и снова откройте терминал.

Проверка версий:

```bash
node -v
npm -v
git --version
yc --version
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

## 3. Установка зависимостей web

```bash
cd apps/web
npm ci
cd ../..
```

## 4. Авторизация в Yandex Cloud и доступ к секретам

Выполните первичную авторизацию (если профиль еще не настроен):

```bash
yc init
```

Проверьте, что CLI видит ваш аккаунт:

```bash
yc iam whoami
```

Проверьте доступ к секрету разработчиков:

```bash
yc lockbox secret get --name ncfg-dev-secrets --format json
```

Что проверить в ответе:
- `status` должен быть `ACTIVE`;
- в `current_version.payload_entry_keys` должен быть `STRAPI_PROD_API_TOKEN`.

Если `STRAPI_PROD_API_TOKEN` нет в ключах секрета, это инфраструктурная проблема. Новый разработчик не должен запрашивать токен вручную у других людей.

## 5. Настройка `apps/web/.env.local` (prod Strapi)

`npm run dev:prod` запускает web с `STRAPI_SOURCE=prod`.

Создайте локальный env-файл и подставьте токен из Lockbox:

```bash
cp apps/web/.env.local.example apps/web/.env.local

STRAPI_PROD_API_TOKEN="$(yc lockbox payload get --name ncfg-dev-secrets --key STRAPI_PROD_API_TOKEN)"

cat > apps/web/.env.local <<ENV
STRAPI_PROD_URL=https://admin.ncfg.ru
STRAPI_PROD_API_TOKEN=${STRAPI_PROD_API_TOKEN}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV

unset STRAPI_PROD_API_TOKEN
```

Важно по безопасности:
- не коммитьте `apps/web/.env.local`;
- не передавайте токен в PR, issue, чатах и логах.

## 6. Запуск web в режиме prod-source

```bash
cd apps/web
npm run dev:prod
```

Проверьте:
- страница открывается на `http://localhost:3000`;
- health endpoint отвечает:

```bash
curl http://localhost:3000/api/health
```

Ожидаемый результат: JSON со `status: "ok"`.

## 7. Создание feature-ветки по правилам проекта

Перед началом работы обновите `main`:

```bash
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

## 8. Внесение изменений и локальная проверка

Сделайте изменения в `apps/web`, затем выполните минимум:

```bash
cd apps/web
npm run lint
```

Если меняли критичную логику данных/рендеринга, дополнительно:

```bash
npm run build
```

## 9. Коммит (Conventional Commits)

Добавьте изменения:

```bash
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

## 10. Push и создание PR

Отправьте ветку:

```bash
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

## 11. Troubleshooting (YC / Lockbox)

`PermissionDenied` при `yc lockbox payload get`:
- проверьте, что ваш аккаунт добавлен в группу `developers`;
- проверьте, что у `developers` есть `lockbox.payloadViewer` на `ncfg-dev-secrets`.

`key not found` для `STRAPI_PROD_API_TOKEN`:
- ключ не добавлен в `ncfg-dev-secrets`;
- передайте задачу владельцу инфраструктуры добавить ключ.

Если секрет использует кастомный KMS-ключ, дополнительно может понадобиться роль `kms.keys.encrypterDecrypter`.

## 12. Финальный чеклист перед отправкой PR

- [ ] Ветка названа по правилам (`<type>/<short-kebab-case>`).
- [ ] Пройден доступ к Lockbox (`ncfg-dev-secrets`) через `yc`.
- [ ] В `payload_entry_keys` есть `STRAPI_PROD_API_TOKEN`.
- [ ] Web запускается через `npm run dev:prod`.
- [ ] Локально пройдено `npm run lint`.
- [ ] При необходимости пройдено `npm run build`.
- [ ] Commit и PR оформлены по Conventional Commits.
- [ ] В PR нет секретов, токенов и лишних файлов.

## Приложение: базовый flow в одном блоке

```bash
# 1) Подготовка
node -v && npm -v && git --version && yc --version
git clone git@github.com:UnidentifiedRaccoon/ncfg.git
cd ncfg
cd apps/web && npm ci
cd ../..

# 2) YC авторизация + проверка секрета
yc init
yc iam whoami
yc lockbox secret get --name ncfg-dev-secrets --format json

# 3) Получение токена и настройка .env.local
STRAPI_PROD_API_TOKEN="$(yc lockbox payload get --name ncfg-dev-secrets --key STRAPI_PROD_API_TOKEN)"
cat > apps/web/.env.local <<ENV
STRAPI_PROD_URL=https://admin.ncfg.ru
STRAPI_PROD_API_TOKEN=${STRAPI_PROD_API_TOKEN}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV
unset STRAPI_PROD_API_TOKEN

# 4) Старт web с продовым Strapi
cd apps/web && npm run dev:prod

# 5) Работа в отдельной ветке
cd ../..
git checkout main && git pull
git checkout -b feat/my-change

# ... изменить код ...

# 6) Проверка + commit + push
cd apps/web && npm run lint
cd ../..
git add <files>
git commit -m "feat(ui): describe change"
git push -u origin HEAD

# 7) PR
gh pr create --base main
```
