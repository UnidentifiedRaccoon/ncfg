import {
  BrainCircuit,
  GraduationCap,
  HandHeart,
  Repeat2,
  type LucideIcon,
} from "lucide-react";

export type MissionAccordionDirectionId = "psychology" | "children" | "support" | "habits";

export interface MissionAccordionDirection {
  id: MissionAccordionDirectionId;
  label: string;
  title: string;
  manifesto: string;
  summary: string;
  detail: string;
  outcomes: readonly string[];
  icon: LucideIcon;
  accentClassName: string;
  glowClassName: string;
}

export const missionAccordionDirections = [
  {
    id: "psychology",
    label: "Финансовая психология",
    title: "Внедрение методик финансовой психологии и работы с установками",
    manifesto: "Сначала меняем внутренний сценарий, а уже потом добавляем инструменты и дисциплину.",
    summary:
      "Этот слой раскрывает, какие реакции, тревога и семейные сценарии управляют финансовыми решениями до появления таблиц и планов.",
    detail:
      "Вместо сухого тезиса карточка показывает, почему разговор о деньгах начинается с установок. Это делает миссию глубже и помогает сразу увидеть практическую опору для дальнейших шагов.",
    outcomes: [
      "снижает импульсивность и тревогу в решениях",
      "делает финансовое поведение более осознанным",
      "готовит основу для устойчивых привычек",
    ],
    icon: BrainCircuit,
    accentClassName:
      "border-[#D4E3F5] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,250,255,0.98)_100%)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.20),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(148,197,255,0.12),transparent_36%)]",
  },
  {
    id: "children",
    label: "Развитие детей",
    title: "Качественное финансовое и экономическое развитие детей",
    manifesto: "Финансовая грамотность ребёнка строится как понятная логика выбора, труда и ответственности.",
    summary:
      "Карточка переводит направление из общей декларации в понятную образовательную рамку, которую легко считывает и родитель, и партнёр.",
    detail:
      "Reveal-сценарий помогает показать не только тему, но и её педагогический смысл: ребёнок растёт в среде, где деньги объясняются спокойно, последовательно и без морализаторства.",
    outcomes: [
      "связывает деньги с реальными бытовыми решениями",
      "поддерживает диалог между взрослыми и детьми",
      "формирует экономическое мышление без перегруза",
    ],
    icon: GraduationCap,
    accentClassName:
      "border-[#DAE8E1] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,251,247,0.98)_100%)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(134,239,172,0.10),transparent_34%)]",
  },
  {
    id: "support",
    label: "Поддержка взрослых",
    title: "Создание поддерживающей среды для взрослых",
    manifesto: "Изменения удерживаются дольше, когда человеку есть на что опереться кроме разовой мотивации.",
    summary:
      "Здесь акцент смещается на среду: доверие, сопровождение и пространство, в котором можно обсуждать деньги без стыда и давления.",
    detail:
      "Активная карточка разворачивает миссию как сервисную сцену, а не как лозунг. Это полезно для реальной главной: блок сразу показывает, что НЦФГ не только обучает, но и поддерживает поведение в процессе изменений.",
    outcomes: [
      "снижает барьер входа в сложные финансовые темы",
      "помогает закреплять решения через окружение",
      "делает миссию более человечной и прикладной",
    ],
    icon: HandHeart,
    accentClassName:
      "border-[#F0DED6] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,243,0.98)_100%)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(253,186,116,0.10),transparent_34%)]",
  },
  {
    id: "habits",
    label: "Здоровые привычки",
    title: "Внедрение здоровых финансовых привычек",
    manifesto: "Финансовое благополучие должно выглядеть как повторяемая практика, а не как вдохновляющий всплеск.",
    summary:
      "Последний слой переводит миссию из идей в рутину: небольшие действия, понятные договорённости и регулярность без лишнего пафоса.",
    detail:
      "Карточка раскрывает это направление как итоговую фиксацию всей системы. После психологической базы, развития детей и поддержки взрослых миссия приходит к самому практичному результату — устойчивому повседневному поведению.",
    outcomes: [
      "переводит знания в измеримые действия",
      "делает повторяемость частью повседневной жизни",
      "собирает миссию в законченную практическую траекторию",
    ],
    icon: Repeat2,
    accentClassName:
      "border-[#D9E1F6] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,246,255,0.98)_100%)]",
    glowClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(165,180,252,0.12),transparent_34%)]",
  },
] satisfies readonly MissionAccordionDirection[];
