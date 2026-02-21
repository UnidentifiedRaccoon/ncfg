# GetCourse: повторные заявки через объект "Заказ"

Эта инструкция настраивает прием заявок сайта так, чтобы **каждая отправка формы** создавала отдельную задачу в GetCourse.

## 1. GitHub Secrets (Actions)

Откройте: `Repository -> Settings -> Secrets and variables -> Actions -> New repository secret`.

### Обязательные

| Secret | Пример |
|---|---|
| `GETCOURSE_BASE_URL` | `https://fgrm.ncfg.ru` |
| `GETCOURSE_API_KEY` | `<api_key_from_getcourse>` |

### Рекомендуемые (дефолты есть, но лучше задать явно)

| Secret | Пример | Назначение |
|---|---|---|
| `GETCOURSE_SOURCE_VALUE` | `fgrm.ncfg.ru` | Источник заявки |
| `GETCOURSE_DEAL_PRODUCT_TITLE_LEAD` | `Website Lead` | Название "товара" для формы заявки |
| `GETCOURSE_DEAL_PRODUCT_TITLE_QUESTION` | `Website Question` | Название "товара" для формы вопроса |
| `GETCOURSE_DEAL_COST` | `0` | Стоимость заказа |
| `GETCOURSE_DEAL_STATUS` | `new` | Статус заказа при создании |

### Для маршрутизации в задачи (обязательно для task-flow)

| Secret | Что указывать |
|---|---|
| `GETCOURSE_DEAL_FIELD_SOURCE` | код доп. поля заказа `source` |
| `GETCOURSE_DEAL_FIELD_COMPANY` | код доп. поля заказа `company` |
| `GETCOURSE_DEAL_FIELD_MESSAGE` | код доп. поля заказа `message` |
| `GETCOURSE_DEAL_FIELD_QUESTION` | код доп. поля заказа `question` |
| `GETCOURSE_DEAL_FIELD_POST_TITLE` | код доп. поля заказа `post_title` |
| `GETCOURSE_DEAL_FIELD_REQUEST_ID` | код доп. поля заказа `request_id` |
| `GETCOURSE_DEAL_FIELD_FORM_TYPE` | код доп. поля заказа `form_type` |

## 2. Что сделать в GetCourse

### 2.1 Создать доп. поля заказа

В GetCourse создайте доп. поля у объекта **Заказ** с кодами:
- `source`
- `company`
- `message`
- `question`
- `post_title`
- `request_id`
- `form_type`

Важно: нужны именно поля **заказа**, не пользователя.

### 2.2 Создать процесс на объекте "Заказы"

1. Откройте раздел процессов и создайте процесс на объекте **Заказы**.
2. Тип запуска: **Периодическая проверка**.
3. Добавьте условия входа:
   - `request_id` задано
   - `deal_status` = `new` (или значение из `GETCOURSE_DEAL_STATUS`)
4. Добавьте действие **Создать задачу**.
5. В описание задачи добавьте:
   - имя, email, телефон
   - `company`
   - `message`
   - `question`
   - `post_title`
   - `source`
   - `request_id`
   - `form_type`
6. Добавьте 2 ветки:
   - `form_type = lead` (фокус на `message`)
   - `form_type = question` (фокус на `question` + `post_title`)
7. Опубликуйте процесс.

## 3. Проверка после деплоя

1. Отправьте 2 раза форму заявки с одинаковым email.
2. Убедитесь, что создались 2 заказа и 2 задачи.
3. Отправьте форму вопроса по статье.
4. Проверьте, что в задаче есть `request_id`, текст обращения и источник.

Ожидаемый результат: каждая отправка формы создает отдельный заказ и отдельную задачу.
