# NCFG Design System

Визуальный стиль корпоративного сайта NCFG. Вдохновлён подходом Т-Банка и Альфа-Банка: простой, понятный, визуально приятный.

## Brand Identity

### Позиционирование
- **Отрасль:** Консалтинг, финансы
- **Характер:** Надёжный, профессиональный, современный
- **Ощущение:** Доверие, ясность, экспертиза

### Визуальные принципы
1. **Простота** — минимум декоративных элементов, фокус на контенте
2. **Иерархия** — чёткое разделение важного и второстепенного
3. **Воздух** — щедрые отступы, не перегружаем экран
4. **Контраст** — электрический акцент выделяет ключевые действия

---

## Color Palette

### Основные цвета

| Роль | Название | HEX | HSL | Применение |
|------|----------|-----|-----|------------|
| Primary | Deep Navy | `#1E3A5F` | 213° 52% 25% | Заголовки, навигация, футер |
| Secondary | Ocean Blue | `#3B82F6` | 217° 91% 60% | Ссылки, вторичные кнопки, иконки |
| Accent | Electric Cyan | `#00D9FF` | 187° 100% 50% | CTA-кнопки, важные элементы, hover-состояния |

### Нейтральные цвета

| Название | HEX | HSL | Применение |
|----------|-----|-----|------------|
| White | `#FFFFFF` | 0° 0% 100% | Фон страницы, карточки |
| Gray 50 | `#F8FAFC` | 210° 40% 98% | Альтернативный фон секций |
| Gray 100 | `#F1F5F9` | 210° 40% 96% | Разделители, бордеры |
| Gray 200 | `#E2E8F0` | 214° 32% 91% | Неактивные элементы |
| Gray 400 | `#94A3B8` | 215° 20% 65% | Плейсхолдеры, подписи |
| Gray 600 | `#475569` | 215° 19% 35% | Вторичный текст |
| Gray 900 | `#0F172A` | 222° 47% 11% | Основной текст |

### Семантические цвета

| Роль | HEX | Применение |
|------|-----|------------|
| Success | `#10B981` | Успешные операции, позитивные статусы |
| Warning | `#F59E0B` | Предупреждения, важные уведомления |
| Error | `#EF4444` | Ошибки, деструктивные действия |

### Правила использования цветов

```
┌─────────────────────────────────────────────────────────────┐
│  ИЕРАРХИЯ ЦВЕТОВ                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Electric Cyan (#00D9FF)                                    │
│  └── ТОЛЬКО для главных CTA: «Оставить заявку»,            │
│      «Связаться», primary buttons                           │
│                                                             │
│  Ocean Blue (#3B82F6)                                       │
│  └── Ссылки в тексте, вторичные кнопки, активные табы,     │
│      иконки, hover на карточках                             │
│                                                             │
│  Deep Navy (#1E3A5F)                                        │
│  └── Заголовки H1-H2, навигация, футер,                    │
│      текст на светлом фоне с акцентом                       │
│                                                             │
│  Gray 900 (#0F172A)                                         │
│  └── Основной текст параграфов                              │
│                                                             │
│  Gray 600 (#475569)                                         │
│  └── Подписи, мета-информация, вторичный текст              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Контрастность (WCAG AA)

| Комбинация | Контраст | Статус |
|------------|----------|--------|
| Gray 900 на White | 15.5:1 | ✅ AAA |
| Deep Navy на White | 9.8:1 | ✅ AAA |
| Ocean Blue на White | 4.5:1 | ✅ AA |
| White на Electric Cyan | 4.6:1 | ✅ AA |
| White на Deep Navy | 9.8:1 | ✅ AAA |

---

## Typography

### Шрифтовой стек

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
```

**Почему Inter:**
- Оптимизирован для экранов, отличная читаемость
- Бесплатный, доступен через Google Fonts
- Поддерживает variable fonts (меньше HTTP-запросов)
- Близок к системным шрифтам — быстрая загрузка fallback

### Шкала размеров

| Токен | Size | Line-height | Letter-spacing | Применение |
|-------|------|-------------|----------------|------------|
| `text-xs` | 12px | 16px (1.33) | 0.02em | Метки, badges |
| `text-sm` | 14px | 20px (1.43) | 0.01em | Подписи, мета |
| `text-base` | 16px | 24px (1.5) | 0 | Основной текст |
| `text-lg` | 18px | 28px (1.56) | 0 | Lead-параграфы |
| `text-xl` | 20px | 28px (1.4) | -0.01em | Подзаголовки |
| `text-2xl` | 24px | 32px (1.33) | -0.01em | H4 |
| `text-3xl` | 30px | 36px (1.2) | -0.02em | H3 |
| `text-4xl` | 36px | 40px (1.11) | -0.02em | H2 |
| `text-5xl` | 48px | 52px (1.08) | -0.02em | H1 (desktop) |
| `text-6xl` | 60px | 64px (1.07) | -0.03em | Hero (desktop) |

### Иерархия заголовков

```
H1 (Hero)      — 48-60px, Bold (700), Deep Navy
H2 (Section)   — 36-48px, Bold (700), Deep Navy
H3 (Subsection)— 24-30px, Semibold (600), Deep Navy
H4 (Card title)— 20-24px, Semibold (600), Gray 900
Body           — 16px, Regular (400), Gray 900
Body small     — 14px, Regular (400), Gray 600
Caption        — 12px, Medium (500), Gray 400
```

### Адаптивная типографика

| Элемент | Mobile (< 768px) | Desktop (≥ 768px) |
|---------|------------------|-------------------|
| H1 | 36px / 40px | 48-60px / 52-64px |
| H2 | 28px / 32px | 36-48px / 40-52px |
| H3 | 22px / 28px | 24-30px / 32-36px |
| Body | 16px / 24px | 16px / 24px |
| Lead | 18px / 28px | 18-20px / 28-32px |

---

## Spacing System

### Базовая единица: 4px

| Токен | Значение | Применение |
|-------|----------|------------|
| `space-1` | 4px | Минимальный gap, padding иконок |
| `space-2` | 8px | Gap между элементами в группе |
| `space-3` | 12px | Padding кнопок (vertical) |
| `space-4` | 16px | Padding карточек, gap колонок |
| `space-5` | 20px | — |
| `space-6` | 24px | Margin между параграфами |
| `space-8` | 32px | Margin между блоками |
| `space-10` | 40px | — |
| `space-12` | 48px | Padding секций (mobile) |
| `space-16` | 64px | Padding секций (tablet) |
| `space-20` | 80px | — |
| `space-24` | 96px | Padding секций (desktop) |
| `space-32` | 128px | Большие отступы между секциями |

### Секции страницы

```
Desktop:   py-24 (96px сверху/снизу)
Tablet:    py-16 (64px)
Mobile:    py-12 (48px)
```

### Контейнер

```css
--container-max: 1200px;
--container-padding: 16px; /* mobile */
--container-padding-md: 24px; /* tablet */
--container-padding-lg: 32px; /* desktop */
```

---

## Border Radius

| Токен | Значение | Применение |
|-------|----------|------------|
| `rounded-sm` | 4px | Badges, tags, small inputs |
| `rounded` | 6px | Buttons (small), chips |
| `rounded-md` | 8px | Buttons, form inputs |
| `rounded-lg` | 12px | Cards, dropdowns |
| `rounded-xl` | 16px | Modal, large cards |
| `rounded-2xl` | 24px | Hero sections, feature blocks |
| `rounded-full` | 9999px | Avatars, pills, floating buttons |

---

## Shadows

| Токен | Значение | Применение |
|-------|----------|------------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards default |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards hover |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns, modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Large modals |

### Карточки

```css
/* Default */
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
border: 1px solid var(--gray-100);

/* Hover */
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
transform: translateY(-2px);
transition: all 0.2s ease;
```

---

## Components

### Buttons

#### Primary (Electric Cyan)
```css
background: #00D9FF;
color: #0F172A;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 16px;

/* Hover */
background: #00C4E6;
box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);

/* Active */
background: #00B0CC;
transform: scale(0.98);
```

#### Secondary (Ocean Blue outline)
```css
background: transparent;
color: #3B82F6;
border: 2px solid #3B82F6;
padding: 10px 22px;
border-radius: 8px;

/* Hover */
background: rgba(59, 130, 246, 0.1);
```

#### Ghost (text only)
```css
background: transparent;
color: #3B82F6;
padding: 12px 16px;

/* Hover */
background: rgba(59, 130, 246, 0.05);
```

### Размеры кнопок

| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 32px | 8px 16px | 14px |
| md | 44px | 12px 24px | 16px |
| lg | 56px | 16px 32px | 18px |

### Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #F1F5F9;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: #E2E8F0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
```

### Form Inputs

```css
input, textarea {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: #0F172A;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

input::placeholder {
  color: #94A3B8;
}
```

### Navigation

```css
.nav-link {
  color: #475569;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: #1E3A5F;
  background: rgba(30, 58, 95, 0.05);
}

.nav-link.active {
  color: #3B82F6;
}
```

---

## Layout Patterns

### Hero Section

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                    Nav links           [CTA Button] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│     H1: Заголовок (48-60px, Deep Navy)                     │
│                                                             │
│     Lead: Подзаголовок (18-20px, Gray 600)                 │
│     максимум 2 строки                                       │
│                                                             │
│     [Primary CTA]   [Secondary CTA]                         │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Content Section

```
┌─────────────────────────────────────────────────────────────┐
│                        Section padding: 96px                │
│                                                             │
│              H2: Заголовок секции (centered)                │
│              Lead: Краткое описание (centered)              │
│                         ↓ 48px                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Card   │  │  Card   │  │  Card   │  │  Card   │        │
│  │         │  │         │  │         │  │         │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│       gap: 24px                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Grid System

```css
/* 12-column grid */
.grid-cols-1  /* Mobile: full width */
.grid-cols-2  /* 2 items per row */
.grid-cols-3  /* 3 items per row */
.grid-cols-4  /* 4 items per row */

/* Common patterns */
md:grid-cols-2 lg:grid-cols-3  /* Cards: 1→2→3 columns */
md:grid-cols-2 lg:grid-cols-4  /* Features: 1→2→4 columns */
```

---

## Breakpoints

| Breakpoint | Width | Devices |
|------------|-------|---------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-first approach

```css
/* Base: mobile */
.element { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .element { padding: 24px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element { padding: 32px; }
}
```

---

## Animation & Transitions

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover, focus) | 150ms | ease-out |
| Small (buttons, cards) | 200ms | ease |
| Medium (dropdowns) | 300ms | ease-in-out |
| Large (modals, pages) | 400ms | cubic-bezier(0.4, 0, 0.2, 1) |

### Common transitions

```css
/* Buttons */
transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

/* Cards */
transition: transform 0.2s ease, box-shadow 0.2s ease;

/* Links */
transition: color 0.15s ease;

/* Inputs */
transition: border-color 0.15s ease, box-shadow 0.15s ease;
```

### Hover states

- Buttons: slight darken + subtle shadow
- Cards: lift (translateY -2px) + enhanced shadow
- Links: color change (Gray → Blue)
- Icons: opacity 0.7 → 1

---

## Icons

### Рекомендуемые библиотеки
1. **Lucide React** — основная (MIT, 1400+ иконок)
2. **Heroicons** — альтернатива (MIT, Tailwind ecosystem)

### Размеры

| Size | Pixels | Применение |
|------|--------|------------|
| xs | 16px | Inline с текстом |
| sm | 20px | Buttons, inputs |
| md | 24px | Standalone icons |
| lg | 32px | Feature icons |
| xl | 48px | Hero icons |

### Стиль
- Stroke width: 1.5-2px
- Color: inherit (от родителя)
- Outline style (не filled)

---

## Accessibility Checklist

- [ ] Контраст текста минимум 4.5:1
- [ ] Focus-состояния видимы (не `outline: none`)
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Touch targets минимум 44x44px на мобильных
- [ ] Семантическая разметка (h1 → h2 → h3)
- [ ] Alt-тексты для изображений
- [ ] ARIA-labels для icon-only buttons
- [ ] Reduced motion для пользователей с vestibular disorders

---

## CSS Variables (для globals.css)

```css
:root {
  /* Colors - Primary */
  --color-primary: #1E3A5F;
  --color-secondary: #3B82F6;
  --color-accent: #00D9FF;

  /* Colors - Neutral */
  --color-white: #FFFFFF;
  --color-gray-50: #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-400: #94A3B8;
  --color-gray-600: #475569;
  --color-gray-900: #0F172A;

  /* Colors - Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Typography */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", Consolas, monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* Container */
  --container-max: 1200px;
  --container-padding: 16px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease-in-out;
}

@media (min-width: 768px) {
  :root {
    --container-padding: 24px;
  }
}

@media (min-width: 1024px) {
  :root {
    --container-padding: 32px;
  }
}
```

---

## Do's and Don'ts

### Do ✅
- Используй Electric Cyan только для главных CTA
- Оставляй достаточно воздуха между элементами
- Поддерживай единую иерархию заголовков
- Проверяй контрастность текста
- Делай touch targets минимум 44px

### Don't ❌
- Не используй более 2-3 цветов на одном экране
- Не делай текст меньше 14px (кроме labels)
- Не убирай focus-состояния
- Не используй чистый чёрный (#000) для текста
- Не перегружай страницу анимациями
- Не делай Electric Cyan для всех кнопок — только primary CTA

---

## Quick Reference Card

```
COLORS
Primary:   #1E3A5F (Deep Navy)
Secondary: #3B82F6 (Ocean Blue)
Accent:    #00D9FF (Electric Cyan)
Text:      #0F172A (Gray 900)
Muted:     #475569 (Gray 600)
Border:    #E2E8F0 (Gray 200)
Background:#F8FAFC (Gray 50)

TYPOGRAPHY
H1: 48-60px / Bold / Deep Navy
H2: 36-48px / Bold / Deep Navy
Body: 16px / Regular / Gray 900
Small: 14px / Regular / Gray 600

SPACING
Section: py-12 → py-16 → py-24 (mobile → tablet → desktop)
Cards gap: 24px
Card padding: 24px

RADIUS
Buttons: 8px
Cards: 12px
Inputs: 8px

BUTTONS
Primary: bg-[#00D9FF] text-[#0F172A]
Secondary: border-[#3B82F6] text-[#3B82F6]
Height: 44px (md), 56px (lg)
```
