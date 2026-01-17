# Архитектура: Adapted Feature-Sliced Design для Next.js

Архитектура фронтенда основана на [Feature-Sliced Design (FSD)](https://feature-sliced.design/), адаптированном под Next.js App Router.

## Почему адаптированный FSD?

Next.js App Router уже управляет роутингом и композицией страниц. Оставляем только слои, которые добавляют ценность.

| Стандартный FSD | Адаптированный | Причина |
|-----------------|----------------|---------|
| app | — | Next.js `app/` берёт на себя |
| pages | — | Next.js `app/` берёт на себя |
| widgets | widgets | Оставляем: сложные UI-блоки |
| features | features | Оставляем: пользовательские действия |
| entities | entities | Оставляем: бизнес-сущности |
| shared | shared | Оставляем: переиспользуемая база |

## Структура проекта

```
apps/web/
├── app/          # Роутинг Next.js (page.tsx, layout.tsx)
├── widgets/      # Секции страниц (Header, Footer, HeroSection)
├── features/     # Действия пользователя (ContactForm, Search)
├── entities/     # Бизнес-объекты (Article, TeamMember, Project)
└── shared/       # Базовые компоненты и утилиты
    ├── ui/       # UI-примитивы (Button, Card, Input)
    ├── lib/      # Утилиты (cn, formatDate)
    ├── api/      # Типы API
    └── hooks/    # Общие хуки
```

## Правила слоёв

### Направление импортов (критично)

Импортировать можно только из слоёв **ниже**. Никогда вверх.

```
app/      → widgets, features, entities, shared
widgets/  → features, entities, shared
features/ → entities, shared
entities/ → shared
shared/   → только внешние пакеты
```

### Структура слайса

Каждый слайс (папка внутри слоя) имеет одинаковую структуру:

```
имя-слайса/
├── ui/         # React-компоненты
├── model/      # Логика, хуки, типы
├── api/        # Запросы данных
└── index.ts    # Публичный API
```

### Публичный API

Каждый слайс экспортирует только публичный интерфейс через `index.ts`:

```typescript
// features/contact-form/index.ts
export { ContactForm } from './ui/ContactForm';
export { useContactForm } from './model/useContactForm';
export type { ContactFormData } from './model/types';
```

**Правило импорта:** всегда из корня слайса, не из внутренних путей.

```typescript
// ✅ Правильно
import { ContactForm } from '@/features/contact-form';

// ❌ Неправильно
import { ContactForm } from '@/features/contact-form/ui/ContactForm';
```

## Ответственность слоёв

### `app/` — Роутинг

- Определяет маршруты, layouts, loading/error состояния
- Минимум логики — только получение данных и композиция
- Собирает страницы из widgets и features

```typescript
// app/(marketing)/news/page.tsx
import { NewsFeed } from '@/widgets/news-feed';
import { getArticles } from '@/entities/article';

export default async function NewsPage() {
  const articles = await getArticles();
  return <NewsFeed articles={articles} />;
}
```

### `widgets/` — Секции страниц

- Собирают features и entities в готовые UI-блоки
- Примеры: Header, Footer, HeroSection, TeamSection, NewsFeed
- Можно вставить на любую страницу без доработки

### `features/` — Действия пользователя

- Инкапсулируют пользовательские взаимодействия
- Примеры: ContactForm, ThemeToggle, Search, NewsletterSignup
- Одна feature = одна пользовательская возможность

### `entities/` — Бизнес-сущности

- Представляют доменные объекты
- Примеры: Article, TeamMember, Project, Partner, Review
- Содержат: типы, API-запросы, компоненты отображения (Card, Preview)
- Без пользовательских взаимодействий — только отображение данных

### `shared/` — Переиспользуемая база

- UI-примитивы, утилиты, типы, хуки, конфиги
- Без бизнес-логики — можно перенести в другой проект

## Куда класть код?

```
Маршрут/страница?           → app/
Секция из нескольких блоков? → widgets/
Форма/действие/переключатель? → features/
Бизнес-объект + отображение?  → entities/
Переиспользуемое без логики?  → shared/
```

## Антипаттерны

| Проблема | Решение |
|----------|---------|
| God-компонент (всё в одном) | Разбить на widget + feature + entity |
| Циклические зависимости | Вынести общее в `shared/` |
| Импорт из внутренних путей | Импортировать из `index.ts` слайса |
| Бизнес-логика в shared | Перенести в соответствующий entity/feature |
| Feature для каждой кнопки | Простые кнопки в `shared/ui` |

## Path Aliases

Настроить в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/widgets/*": ["./widgets/*"],
      "@/features/*": ["./features/*"],
      "@/entities/*": ["./entities/*"],
      "@/shared/*": ["./shared/*"]
    }
  }
}
```

## Миграция

1. Создать `shared/` — перенести UI-примитивы, утилиты, типы
2. Создать `entities/` — выделить бизнес-объекты
3. Создать `features/` — выделить пользовательские взаимодействия
4. Создать `widgets/` — скомпоновать features и entities
5. Упростить `app/` — страницы импортируют из widgets

## Ресурсы

- [Feature-Sliced Design Docs](https://feature-sliced.design/)
- [FSD + Next.js Discussion](https://github.com/feature-sliced/documentation/discussions/66)
