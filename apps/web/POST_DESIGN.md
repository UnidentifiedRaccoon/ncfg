# Post Content Design System

Design system for styling HTML content inside blog posts. Applied via `.post-content` CSS class.

## Typography

| Element | Font Size | Font Weight | Color | Spacing |
|---------|-----------|-------------|-------|---------|
| `<p>` | 16px | normal | #475569 | mb-4 |
| `<h2>` | 24px | semibold (600) | #1E3A5F | mt-8 mb-4 |
| `<h3>` | 20px | semibold (600) | #1E3A5F | mt-6 mb-3 |
| `<strong>` | inherit | semibold (600) | #1E3A5F | - |

## Line Height

- Paragraphs: 1.625 (26px at 16px font)
- Headings: 1.3

## Lists

| Element | Style | Left Padding | Vertical Spacing |
|---------|-------|--------------|------------------|
| `<ul>` | disc | 24px (pl-6) | my-4 |
| `<ol>` | decimal | 24px (pl-6) | my-4 |
| `<li>` | - | - | mb-2 |

List items inherit paragraph color (#475569).

## Links

| State | Color | Text Decoration |
|-------|-------|-----------------|
| Default | #3B82F6 | none |
| Hover | #3B82F6 | underline |

## Blockquote

| Property | Value |
|----------|-------|
| Border | left-4 #3B82F6 |
| Padding | pl-4 py-3 |
| Background | #F8FAFC |
| Font Style | italic |
| Color | #475569 |
| Spacing | my-6 |

## Images

| Property | Value |
|----------|-------|
| Max Width | 100% |
| Border Radius | 12px (rounded-xl) |
| Spacing | my-6 |

### PostCard Covers (Blog)

- Aspect ratio: **4:3** (`object-cover`)
- Recommended upload size: **1200×900** (or smaller, same ratio), prefer **webp**
- Fallback (when no image): branded auto-cover (gradient + subtle pattern + watermark `НЦФГ`)

## Code

| Element | Background | Padding | Font |
|---------|------------|---------|------|
| `<code>` (inline) | #F1F5F9 | px-1.5 py-0.5 | mono, 14px |
| `<pre>` | #F1F5F9 | p-4 | mono, 14px |

## Tables

| Property | Value |
|----------|-------|
| Border | 1px #E2E8F0 |
| Header BG | #F8FAFC |
| Cell Padding | px-4 py-2 |
| Header Weight | semibold |

## CSS Variables Reference

All colors use design tokens from `globals.css`:

```css
--color-primary: #1E3A5F    /* Headings, strong */
--color-secondary: #3B82F6  /* Links, accents */
--color-gray-50: #F8FAFC    /* Blockquote bg */
--color-gray-100: #F1F5F9   /* Code bg */
--color-gray-200: #E2E8F0   /* Borders */
--color-gray-600: #475569   /* Body text */
```

## Layout

| Элемент | Max Width | Примечание |
|---------|-----------|------------|
| Article container | 760px | Заголовок + картинка |
| .post-content wrapper | 624px | Совпадает с PostCard |
| PostQuestionForm | 760px | — |
| OtherPosts section | 760px | Фон #F8FAFC |
| PostCard | 760px | Desktop max width; cover 4:3. `.post-content` остаётся 624px |
