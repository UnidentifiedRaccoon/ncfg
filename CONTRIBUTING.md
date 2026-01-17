# Contributing

Руководство по работе с Git: ветки, коммиты, Pull Requests.

## 1. Базовые принципы

- `main` всегда в рабочем состоянии.
- Любые изменения — через Pull Request.
- Один PR = одна логическая задача.
- Чем меньше PR, тем быстрее и качественнее ревью.

---

## 2. Единый набор типов

Один и тот же набор `<type>` используется **везде**: в названиях веток, в сообщениях коммитов, в названиях PR.

| Тип        | Описание                                              |
|------------|-------------------------------------------------------|
| `feat`     | Новая функциональность                                |
| `fix`      | Исправление бага                                      |
| `docs`     | Документация                                          |
| `refactor` | Переработка кода без изменения поведения              |
| `perf`     | Оптимизация производительности                        |
| `test`     | Добавление/правка тестов                              |
| `style`    | Форматирование, линтерные правки без изменения логики |
| `build`    | Сборка, инструменты сборки, зависимости               |
| `ci`       | CI/CD, GitHub Actions и т.п.                          |
| `chore`    | Прочая рутина (скрипты, мелкие настройки, техдолг)    |

**Подробнее:**
- [Conventional Commits (спецификация)](https://www.conventionalcommits.org/en/v1.0.0/)
- [Conventional Commit Types Cheatsheet](https://www.bavaga.com/blog/2025/01/27/my-ultimate-conventional-commit-types-cheatsheet)

---

## 3. Ветки

### 3.1. Типичный workflow

```bash
git checkout main
git pull
git checkout -b <type>/<short-kebab-case>

# работа над задачей...

git add .
git commit -m "<type>(scope): description"
git push -u origin HEAD
gh pr create
```

### 3.2. Правила именования веток

**Формат:**

```
<type>/<short-kebab-case>
```

**С тикетом (опционально):**

```
<type>/<ticket>-<short-kebab-case>
```

**Примеры:**
- `feat/onboarding`
- `fix/NCFG-132-auth-magic-link`
- `docs/contributing-guide`

---

## 4. Коммиты (Conventional Commits)

### 4.1. Формат

```
<type>[(scope)]: <description>

[optional body]

[optional footer(s)]
```

**Примеры:**
- `feat(auth): add magic link sign-in`
- `fix(api): handle 401 from backend`
- `docs(readme): update local setup`

### 4.2. Scope (область)

Выбирай из понятных областей проекта:

- **App:** `app`, `ui`, `components`, `pages`, `routes`
- **Backend:** `api`, `server`, `db`
- **Фичи:** `auth`, `payments`, `analytics`
- **Инфра:** `config`, `deps`, `ci`

### 4.3. Breaking Changes

Если изменение ломает обратную совместимость:

1. Добавь `!` после типа:
   ```
   feat(api)!: change response schema
   ```

2. И/или добавь в теле коммита:
   ```
   BREAKING CHANGE: response now returns array instead of object
   ```
[Conventional Commits (спецификация)](https://www.conventionalcommits.org/en/v1.0.0/)

---

## 5. Pull Request (PR)

### 5.1. Название PR

Формат как у коммита:

```
<type>[(scope)]: <summary>
```

**Примеры:**
- `feat(ui): add pricing section`
- `fix(auth): prevent redirect loop`

### 5.2. Размер и фокус

- PR должен быть "обозримым".
- Не смешивай в одном PR разные задачи: фичу + рефакторинг + форматирование + обновление зависимостей.
- Если задача большая — разбей на несколько PR.

### 5.3. Ревью

- Перед мерджем нужен апрув коллеги.
- Отвечай на комментарии, резолви дискуссии.

---

## 6. Мерж-стратегия

- **Squash & merge** в `main` — один PR превращается в один коммит в истории.
- После merge — удалить ветку (GitHub делает это автоматически, если настроено).
