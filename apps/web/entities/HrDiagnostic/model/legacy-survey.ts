import type { HrDiagnosticGroup, HrDiagnosticTest } from "./types";

export const HR_DIAGNOSTIC_SLUG = "hr";
export const HR_DIAGNOSTIC_VERSION = 1;
export const HR_DIAGNOSTIC_TITLE = "Диагностика HR";
export const HR_DIAGNOSTIC_TEST_TITLE = "Анкета-скрининг для HR";
export const HR_DIAGNOSTIC_PROJECT_TITLE = "Проект «ФинБлаго (корп)»";
export const HR_DIAGNOSTIC_CONTACT_EMAIL = "info@finzdorov.pro";
export const HR_DIAGNOSTIC_INTERVIEW_HREF =
  "mailto:info@finzdorov.pro?subject=%D0%97%D0%B0%D0%BF%D0%B8%D1%81%D1%8C%20%D0%BD%D0%B0%20HR-%D0%B8%D0%BD%D1%82%D0%B5%D1%80%D0%B2%D1%8C%D1%8E%20%D0%A4%D0%B8%D0%BD%D0%91%D0%BB%D0%B0%D0%B3%D0%BE";
export const HR_DIAGNOSTIC_GUIDE_HREF =
  "mailto:info@finzdorov.pro?subject=%D0%93%D0%B0%D0%B9%D0%B4%20%D0%BF%D0%BE%20%D1%84%D0%B8%D0%BD%D0%B0%D0%BD%D1%81%D0%BE%D0%B2%D0%BE%D0%BC%D1%83%20%D0%B1%D0%BB%D0%B0%D0%B3%D0%BE%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%8E";

export const HR_TARGET_ROLE_KEYS = new Set([
  "hr_director",
  "hrbp",
  "learning",
  "comp_benefits",
  "wellbeing",
  "leader",
]);

export const HR_DIAGNOSTIC_GROUPS: HrDiagnosticGroup[] = [
  {
    key: "company",
    title: "О вас и вашей компании",
    questions: [
      {
        key: "role",
        title: "Какова ваша роль в компании?",
        type: "radio",
        required: true,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "hr_director", label: "HR-директор / CHRO" },
          { key: "hrbp", label: "HRBP / HR-генералист" },
          { key: "learning", label: "L&D / T&D (обучение и развитие)" },
          { key: "comp_benefits", label: "C&B (компенсации и льготы)" },
          { key: "wellbeing", label: "Well-being / корпоративное здоровье" },
          { key: "leader", label: "Руководитель / CEO / собственник" },
        ],
      },
      {
        key: "company_size",
        title: "Сколько сотрудников в вашей компании?",
        type: "radio",
        required: true,
        options: [
          { key: "under_100", label: "До 100" },
          { key: "100_300", label: "100-300" },
          { key: "301_1000", label: "301-1 000" },
          { key: "1001_5000", label: "1 001-5 000" },
          { key: "over_5000", label: "Более 5 000" },
        ],
      },
      {
        key: "industry",
        title: "В какой отрасли работает ваша компания?",
        type: "radio",
        required: false,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "finance", label: "Финансы / банки / страхование" },
          { key: "manufacturing", label: "Производство / промышленность" },
          { key: "retail", label: "Ретейл / торговля" },
          { key: "it", label: "IT / технологии" },
          { key: "construction", label: "Строительство / девелопмент" },
          { key: "healthcare", label: "Здравоохранение / фармацевтика" },
          { key: "education", label: "Образование" },
          { key: "government", label: "Государственный сектор" },
          { key: "transport", label: "Транспорт / логистика" },
        ],
      },
      {
        key: "region",
        title: "В каком регионе базируется ваша компания (основной офис)?",
        type: "radio",
        required: false,
        options: [
          { key: "moscow", label: "Москва" },
          { key: "spb", label: "Санкт-Петербург" },
          {
            key: "million_plus_city",
            label: "Другой город-миллионник (Екатеринбург, Новосибирск, Казань, Краснодар и др.)",
          },
          { key: "regional_center", label: "Региональный центр (до 1 млн жителей)" },
          { key: "federal_network", label: "Несколько регионов / федеральная сеть" },
        ],
      },
    ],
  },
  {
    key: "wellbeing",
    title: "Well-being и финансовое благополучие",
    questions: [
      {
        key: "has_wellbeing_program",
        title: "Есть ли в вашей компании корпоративные программы благополучия (well-being) для сотрудников?",
        type: "radio",
        required: true,
        options: [
          {
            key: "comprehensive",
            label: "Да, комплексная программа (физическое, ментальное, социальное, финансовое)",
          },
          {
            key: "partial",
            label: "Да, частичная - отдельные направления (например, ДМС и спорт)",
          },
          { key: "planning", label: "Нет, но планируем в ближайший год" },
          { key: "no_not_planning", label: "Нет, и пока не планируем" },
          { key: "unknown", label: "Не знаю / не в моей зоне ответственности" },
        ],
      },
      {
        key: "wellbeing_metrics",
        title: "Как вы измеряете результаты программ благополучия для сотрудников?",
        description: "Выберите все подходящие варианты",
        type: "checkbox",
        required: false,
        allowOther: true,
        otherLabel: "Другое",
        showWhen: {
          questionKey: "has_wellbeing_program",
          operator: "not_in",
          optionKeys: ["no_not_planning", "unknown"],
        },
        options: [
          {
            key: "engagement_surveys",
            label: "Опросы удовлетворённости / вовлечённости сотрудников (eNPS, пульс-опросы)",
          },
          { key: "turnover", label: "Показатели текучести персонала" },
          { key: "absenteeism", label: "Абсентеизм / уровень больничных" },
          {
            key: "stress_fin_health",
            label: "Диагностика уровня стресса или финансового здоровья",
          },
          { key: "event_feedback", label: "Обратная связь после мероприятий (реакция, анкеты)" },
          { key: "roi_business", label: "ROI и бизнес-метрики (продуктивность, ошибки, выручка)" },
          { key: "not_measured", label: "Не измеряем / нет системы измерения" },
        ],
      },
      {
        key: "financial_wellbeing_assets",
        title: "Есть ли в вашей компании что-то из следующего для сотрудников?",
        description: "Выберите всё, что подходит",
        type: "checkbox",
        required: false,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "webinars", label: "Вебинары / лекции по личным финансам" },
          { key: "online_course", label: "Онлайн-курс по финансовой грамотности" },
          { key: "advisor_consultations", label: "Консультации финансового советника" },
          { key: "eap_finance", label: "Программы помощи сотруднику (EAP) с финансовым блоком" },
          { key: "finance_app", label: "Корпоративный сервис / приложение по финансам" },
          { key: "preferential_credit", label: "Льготные условия кредитования через работодателя" },
          { key: "none", label: "Ничего из перечисленного" },
        ],
      },
      {
        key: "financial_stress_impact",
        title: "Насколько вы согласны с утверждением: «Финансовый стресс сотрудников напрямую влияет на их продуктивность и вовлечённость»?",
        type: "likert",
        required: true,
        options: [
          { key: "1", label: "1 - Совсем не согласен(а)" },
          { key: "2", label: "2 - Скорее не согласен(а)" },
          { key: "3", label: "3 - Нейтрально" },
          { key: "4", label: "4 - Скорее согласен(а)" },
          { key: "5", label: "5 - Полностью согласен(а)" },
        ],
      },
      {
        key: "barriers",
        title: "Что является главным барьером для внедрения программ финансового благополучия в вашей компании?",
        description: "Выберите до 2 вариантов",
        type: "checkbox",
        required: false,
        maxSelections: 2,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "no_budget", label: "Нет бюджета" },
          { key: "roi_hard", label: "Сложно обосновать ROI перед руководством" },
          { key: "no_provider", label: "Нет подходящего провайдера или решения" },
          { key: "taboo", label: "Тема «личных финансов» - табу для корпоративной культуры" },
          { key: "no_employee_interest", label: "Сотрудники не заинтересованы в таком обучении" },
          { key: "no_owner", label: "Нет человека, который отвечает за это направление" },
          { key: "no_barriers", label: "Уже всё есть, барьеров нет" },
        ],
      },
      {
        key: "why_financial_literacy",
        title: "Зачем, по вашему мнению, компании нужна финансовая грамотность сотрудников?",
        description: "Выберите все подходящие варианты",
        type: "checkbox",
        required: false,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "productivity", label: "Повысить производительность и эффективность бизнеса" },
          { key: "engagement", label: "Повысить мотивацию и вовлеченность персонала" },
          {
            key: "reduce_stress",
            label: "Снизить финансовый стресс и его влияние на работоспособность",
          },
          {
            key: "reduce_risky_behavior",
            label: "Снизить риски нежелательного финансового поведения сотрудников",
          },
          { key: "retention", label: "Привлечь и удержать ценных сотрудников" },
          { key: "hr_brand", label: "Укрепить HR-бренд и привлекательность работодателя" },
        ],
      },
    ],
  },
  {
    key: "expectations",
    title: "Ваш запрос и ожидания",
    questions: [
      {
        key: "importance_of_methods",
        title: "Насколько вам как HR-специалисту важно иметь доступ к методическим материалам по финансовому благополучию сотрудников?",
        type: "likert",
        required: true,
        options: [
          { key: "1", label: "1 - Совсем не важно" },
          { key: "2", label: "2 - Скорее не важно" },
          { key: "3", label: "3 - Нейтрально" },
          { key: "4", label: "4 - Скорее важно" },
          { key: "5", label: "5 - Очень важно" },
        ],
      },
      {
        key: "valuable_formats",
        title: "Какие форматы поддержки для HR по теме финансового благополучия были бы для вас наиболее ценны?",
        description: "Выберите до 3 вариантов",
        type: "checkbox",
        required: false,
        maxSelections: 3,
        allowOther: true,
        otherLabel: "Другое",
        options: [
          { key: "checklists", label: "Чек-листы и шаблоны для запуска программ" },
          { key: "research", label: "Исследования и аналитика рынка" },
          { key: "cases", label: "Кейсы других компаний" },
          { key: "roi_calculator", label: "Калькулятор ROI программ" },
          { key: "consulting", label: "Консультации и экспертная поддержка" },
          { key: "community", label: "Закрытое HR-сообщество (обмен опытом)" },
          { key: "webinars", label: "Вебинары и онлайн-встречи по теме" },
          { key: "employee_app", label: "Цифровое приложение для сотрудников" },
        ],
      },
      {
        key: "email",
        title: "Оставьте, пожалуйста, ваш email для получения результатов исследования",
        description:
          "Email используется только для отправки результатов исследования и, при желании, для связи по поводу интервью.",
        type: "email",
        required: false,
      },
      {
        key: "subscribe_materials",
        title: "Хотите получать полезные материалы НЦФГ по теме финансового благополучия сотрудников?",
        type: "radio",
        required: false,
        options: [
          { key: "yes", label: "Да, хочу получать материалы" },
          { key: "no", label: "Нет, спасибо" },
        ],
      },
    ],
  },
];

export const HR_DIAGNOSTIC_QUESTIONS = HR_DIAGNOSTIC_GROUPS.flatMap(
  (group) => group.questions
);

export const LEGACY_HR_DIAGNOSTIC_TEST: HrDiagnosticTest = {
  slug: HR_DIAGNOSTIC_SLUG,
  version: HR_DIAGNOSTIC_VERSION,
  title: HR_DIAGNOSTIC_TITLE,
  testTitle: HR_DIAGNOSTIC_TEST_TITLE,
  projectTitle: HR_DIAGNOSTIC_PROJECT_TITLE,
  contactEmail: HR_DIAGNOSTIC_CONTACT_EMAIL,
  interviewHref: HR_DIAGNOSTIC_INTERVIEW_HREF,
  guideHref: HR_DIAGNOSTIC_GUIDE_HREF,
  introLead:
    "Привет! Вы занимаетесь управлением персоналом или развитием сотрудников в своей компании?",
  introBody:
    "Национальный центр финансовой грамотности проводит исследование:\nкак российские компании работают с финансовым благополучием своих людей.\n\nАнкета займёт 5-7 минут. Ваши ответы помогут разработать реально полезные инструменты для HR-специалистов и руководителей.",
  introGiftText: "Подарок. В конце анкеты вас ждёт приятный бонус.",
  anonymousNotice: "Все ответы анонимны и используются только в обобщённом виде.",
  groups: HR_DIAGNOSTIC_GROUPS,
  targetCompletion: {
    title: "Большое спасибо за участие!",
    body:
      "Ваши ответы помогут нам разработать реально полезные инструменты для HR-сообщества.",
    giftTitle: "Подарок. Обещанный бонус - книга в подарок!",
    giftBody:
      "Мы приглашаем вас на короткое личное интервью - 45-60 минут онлайн. Хотим глубже разобраться в вашем опыте и задачах. Интервью - не продажа. Нас интересует ваш реальный опыт и мнение.",
    ctaLabel: "Записаться на интервью и выбрать книгу",
    ctaHref: HR_DIAGNOSTIC_INTERVIEW_HREF,
  },
  nonTargetCompletion: {
    title: "Большое спасибо за участие!",
    body: "Ваши ответы очень важны для нас. Мы учтём их в нашем исследовании.",
    giftTitle: "В подарок - гайд",
    giftBody:
      "Если вы хотите узнать о результатах исследования или материалах НЦФГ по теме финансового благополучия, свяжитесь с нами.",
    ctaLabel: "Получить гайд",
    ctaHref: HR_DIAGNOSTIC_GUIDE_HREF,
  },
};
