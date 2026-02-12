# NCFG 3D CGI Meta-Prompt

Мета-промпт для генерации 3D-иллюстраций/CGI-рендеров в едином визуальном стиле NCFG.

## Базовый шаблон (универсальный)

```
Abstract 3D CGI render, [OBJECT], glossy and matte materials,
deep navy blue (#1E3A5F) and electric cyan (#58A8E0) gradient,
soft studio lighting with cyan rim light accents,
subtle reflections on surfaces, clean minimal white/light gray background,
professional corporate aesthetic, financial consulting mood,
hyperrealistic octane render, 8K quality,
shallow depth of field, soft shadows,
modern fintech visual style similar to Tinkoff Bank
--ar 16:9 --v 6 --s 250
```

## Варианты [OBJECT] по разделам

| Раздел | Объект | Промпт-фрагмент |
|--------|--------|-----------------|
| **Hero главная** | Абстрактная композиция | `interconnected floating spheres and torus shapes, dynamic composition` |
| **О компании** | Структура/рост | `ascending geometric blocks forming upward staircase, growth metaphor` |
| **Услуги** | Трансформация | `morphing liquid metal cube transforming into sphere, seamless transition` |
| **Экспертиза** | Точность | `precision-cut crystal prism refracting light rays` |
| **Партнёры** | Связи | `interlocking chain links with metallic finish, unity concept` |
| **Контакты** | Коммуникация | `smooth pebble stones balanced in zen stack, approachable warmth` |

## Модификаторы стиля

### Материалы

| Материал | Эффект | Когда использовать |
|----------|--------|-------------------|
| `glossy ceramic surface` | Премиальность | Hero, ключевые секции |
| `brushed metal finish` | Технологичность | Услуги, экспертиза |
| `frosted glass translucency` | Современность | О компании, партнёры |
| `soft rubber matte` | Дружелюбность | Контакты, команда |

### Освещение

| Тип | Эффект |
|-----|--------|
| `three-point studio lighting` | Классика, сбалансированность |
| `dramatic side lighting` | Акцент, глубина |
| `soft ambient HDRI` | Мягкость, естественность |

### Настроение

- `warm` — для дружелюбных секций (контакты, команда)
- `cool professional` — для корпоративных (услуги, экспертиза)
- `dynamic energy` — для hero и ключевых CTA

## Быстрый копипаст

```
Abstract 3D CGI render, [ВАШ ОБЪЕКТ],
glossy ceramic and brushed metal materials,
deep navy (#1E3A5F) base with electric cyan (#58A8E0) accents,
soft three-point studio lighting, cyan rim light,
clean white gradient background,
professional fintech aesthetic, trust and clarity mood,
octane render, 8K, shallow DOF, soft shadows
--ar 16:9 --v 6 --s 250
```

## Negative prompt (для SD/DALL-E)

```
text, watermark, logo, human figures, realistic photography,
noisy, grainy, low quality, blurry, oversaturated colors,
neon pink, green, orange, busy background, clutter
```

## Соотношения сторон

| Формат | Параметр | Применение |
|--------|----------|------------|
| Hero desktop | `--ar 16:9` | Полноширинные секции |
| Hero mobile | `--ar 9:16` | Мобильные hero |
| Карточки | `--ar 4:3` | Превью услуг, новостей |
| Квадрат | `--ar 1:1` | Иконки, аватары |

## Примеры готовых промптов

### Hero главной страницы

```
Abstract 3D CGI render, interconnected floating spheres and torus shapes
in dynamic ascending composition, glossy ceramic and brushed metal materials,
deep navy blue (#1E3A5F) and electric cyan (#58A8E0) gradient,
soft three-point studio lighting with cyan rim light accents,
subtle reflections on surfaces, clean minimal white gradient background,
professional corporate aesthetic, financial consulting mood, dynamic energy,
hyperrealistic octane render, 8K quality, shallow depth of field, soft shadows,
modern fintech visual style similar to Tinkoff Bank
--ar 16:9 --v 6 --s 250
```

### Секция услуг

```
Abstract 3D CGI render, morphing liquid metal cube transforming into perfect sphere,
seamless transition effect, brushed metal and frosted glass materials,
deep navy (#1E3A5F) base with electric cyan (#58A8E0) highlights,
dramatic side lighting with cyan rim light,
clean white background, cool professional mood,
octane render, 8K, shallow DOF, soft shadows
--ar 16:9 --v 6 --s 250
```

### Секция контактов

```
Abstract 3D CGI render, smooth pebble stones balanced in zen stack,
soft rubber matte and glossy ceramic materials,
deep navy (#1E3A5F) and warm electric cyan (#58A8E0) tones,
soft ambient HDRI lighting, warm approachable mood,
clean minimal background, trust and clarity feeling,
octane render, 8K, shallow DOF, soft shadows
--ar 16:9 --v 6 --s 250
```

---

## Связанные файлы

- [DESIGN.md](./DESIGN.md) — основная дизайн-система NCFG
- Цветовая палитра: Deep Navy `#1E3A5F`, Ocean Blue `#3B82F6`, Electric Cyan `#58A8E0`
