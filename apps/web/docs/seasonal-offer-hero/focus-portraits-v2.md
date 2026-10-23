# Портреты для редакционного Focus

> Архивные ссылки ведут на закрытый ZIP v3 в Google Drive; требуется доступ владельца. Путь в скобках — расположение файла внутри ZIP, а не прямая ссылка на файл. После скачивания и распаковки используйте этот путь локально.

Созданы 12 сентября 2026 года встроенным imagegen по выбранному направлению с одним вертикальным и двумя квадратными портретами. Это новые иллюстративные персонажи. Исходники сохранены без дополнительного сжатия и ретуши.

Пользователь выбрал композицию с тремя крупными портретами и поручил подключить её в коде как новый вариант. Согласованный визуальный ориентир — [архив v3](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/concepts/focus-portraits-v2-preview.png`). Это локальное расширение лаборатории; новый выбор направления или случайный concept seed не требуется.

## Контракт реализации

- THESIS: люди разных возрастов поддерживают предложение о финансовом благополучии; текст остаётся самостоятельным смысловым центром.
- OWN-WORLD: белое поле, фирменный тёмно-синий, одна голубая кнопка, плотный Roboto Condensed и фотографические портреты.
- STORY: прочитать предложение и шесть форматов, перейти к обсуждению программы; пояснение сохраняет границу между well-being и оплатой труда.
- FIRST VIEWPORT: четыре строки заголовка слева; справа один вертикальный портрет и два почти квадратных. На телефоне сначала текст с CTA, затем вся группа портретов.
- FORM: закреплённый пользователем редакционный Focus, шестой вариант; основание — согласованный эскиз, без генерации нового направления.

## Фотографии

| Место в композиции | Файл | Размер |
| --- | --- | --- |
| Крупный вертикальный портрет | [portrait-specialist.png](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/sources/focus-portraits-v2/portrait-specialist.png`) | 887 × 1774 px |
| Верхний квадратный портрет | [portrait-engineer.png](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/sources/focus-portraits-v2/portrait-engineer.png`) | 1254 × 1254 px |
| Нижний квадратный портрет | [portrait-colleague.png](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/sources/focus-portraits-v2/portrait-colleague.png`) | 1254 × 1254 px |

Общее направление: мягкий оконный свет слева, сине-серый фон, естественные оттенки кожи, заметная фактура волос и ткани. Основной портрет — внимательная полуулыбка; зрелый специалист — спокойный прямой взгляд; молодой сотрудник — открытая улыбка и поворот к собеседнику. При размещении сохранять пропорции и запас над головой.

Полные запросы генерации: [focus-portraits-v2.prompts.json](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/sources/records/focus-portraits-v2.prompts.json`).

[Эскиз шапки с новыми портретами](https://drive.google.com/file/d/1qOG58Ap8CPjD8QY9t8RdZybufK2SyVo5/view) (`ncfg-archive/design/seasonal-offer/concepts/focus-portraits-v2-preview.png`) — 1586 × 992 px. Создан imagegen с исходным эскизом как целью редактирования и тремя отдельными портретами как источниками для замены фотографий. Это визуальный эскиз; для реализации следует использовать отдельные PNG-портреты.

Композиция реализована в компоненте `EditorialFocusHero`: отдельный маршрут `/experiments/seasonal-offer-editorial` и шестая вкладка «Редакционный» в лаборатории `/experiments/seasonal-offer-hero`. Новый вариант выбран по умолчанию. Каждый портрет подключён отдельным `next/image`; текст и CTA остаются HTML-элементами. Motion однократно раскрывает композицию при входе; уменьшенное движение отключает анимацию, на телефоне остаётся только короткое вертикальное смещение.
