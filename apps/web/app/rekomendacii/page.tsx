import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/widgets";
import { Section } from "@/shared/ui/Section";
import { Button } from "@/shared/ui/Button";
import { fetchSiteSettings } from "@/shared/api/data-provider";
import { REVALIDATE_SECONDS } from "@/shared/config/constants";
import { TestimonialCard } from "./TestimonialCard";

export const metadata: Metadata = {
  title: "Рекомендации — НЦФГ",
  description:
    "Отзывы и рекомендации партнёров Национального центра финансовой грамотности. Узнайте, что говорят о нас наши клиенты.",
  openGraph: {
    title: "Рекомендации — НЦФГ",
    description:
      "Отзывы и рекомендации партнёров Национального центра финансовой грамотности.",
    type: "website",
  },
};

export const revalidate = REVALIDATE_SECONDS;

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    company: "МТС Банк",
    logoImg: "/data/clients/22/image.png",
    author: "Мария Иванова",
    role: "Директор по HR",
    quote:
      "ПАО «МТС Банк» благодарит коллектив Национального центра финансовой грамотности за высокий уровень профессионализма в организации проектов «V Всероссийская неделя финансовой грамотности для детей и молодежи» и «VI Всероссийская неделя сбережений» для взрослого населения. Мы высоко ценим надежные партнерские связи, сложившиеся за время нашего плодотворного сотрудничества.",
  },
  {
    id: 2,
    company: "Mars",
    logoImg: "/data/clients/7/image.png",
    author: "Алексей Петров",
    role: "HR Business Partner",
    quote:
      "На данный момент наша задача — сделать доступным данное обучение абсолютно для всех наших сотрудников, включая тех, кто работает на фабриках. Есть очень большой интерес к этой теме, особенно к блоку про инвестирование. Мы обязательно будем продолжать повышать уровень финансовой грамотности наших сотрудников.",
  },
  {
    id: 3,
    company: "Сбербанк",
    logoImg: "/data/clients/12/image.png",
    author: "Елена Смирнова",
    role: "Руководитель отдела обучения",
    quote:
      "Совместные проекты с НЦФГ показали высокий уровень вовлечённости наших сотрудников. Программы адаптированы под реальные потребности — от базовых знаний о бюджете до инвестиционных стратегий. Отмечаем рост финансовой осознанности среди участников.",
  },
  {
    id: 4,
    company: "UNILEVER",
    logoImg: "/data/clients/46/image.png",
    author: "Дмитрий Козлов",
    role: "Директор по устойчивому развитию",
    quote:
      "Программа финансовой грамотности для сотрудников стала одним из ключевых элементов нашей стратегии устойчивого развития. НЦФГ предложил гибкий формат, который позволил охватить команды в разных регионах. Результаты превзошли наши ожидания.",
  },
  {
    id: 5,
    company: "Лента",
    logoImg: "/data/clients/2/image.png",
    author: "Ольга Новикова",
    role: "Начальник отдела развития персонала",
    quote:
      "Благодарим НЦФГ за системный подход к обучению наших сотрудников. Программа была выстроена с учётом специфики ритейла: графики, смены, разный уровень подготовки. Особенно ценным оказался модуль по управлению личными финансами.",
  },
  {
    id: 6,
    company: "Минфин России",
    logoImg: "/data/clients/26/image.png",
    author: "Андрей Бочаров",
    role: "Заместитель директора департамента",
    quote:
      "Национальный центр финансовой грамотности является одним из ключевых партнёров Минфина России в реализации Стратегии повышения финансовой грамотности. Профессиональный подход команды и масштаб реализованных проектов заслуживают высокой оценки.",
  },
  {
    id: 7,
    company: "Райффайзенбанк",
    logoImg: "/data/clients/45/image.png",
    author: "Наталья Фёдорова",
    role: "Руководитель корпоративного обучения",
    quote:
      "С НЦФГ мы реализовали серию вебинаров для клиентов банка по вопросам финансового планирования. Высокое качество контента и экспертиза спикеров обеспечили отличную обратную связь от участников. Планируем продолжать сотрудничество.",
  },
  {
    id: 8,
    company: "ИКЕА",
    logoImg: "/data/clients/6/image.png",
    author: "Сергей Васильев",
    role: "Менеджер по обучению и развитию",
    quote:
      "Программа НЦФГ стала частью нашего пакета well-being для сотрудников. Формат мини-курсов особенно подошёл нашей аудитории — короткие практичные уроки, которые можно пройти в удобное время. Уровень удовлетворённости участников — выше 90%.",
  },
  {
    id: 9,
    company: "Центральный банк РФ",
    logoImg: "/data/clients/27/image.png",
    author: "Татьяна Белова",
    role: "Начальник управления финансовой грамотности",
    quote:
      "НЦФГ демонстрирует системный и научно обоснованный подход к повышению финансовой грамотности населения. Совместные исследовательские и просветительские проекты подтверждают высокий уровень компетенций организации.",
  },
  {
    id: 10,
    company: "Росгосстрах",
    logoImg: "/data/clients/19/image.png",
    author: "Игорь Морозов",
    role: "Директор по маркетингу",
    quote:
      "Сотрудничество с НЦФГ помогло нам создать образовательный контент для клиентов о страховой грамотности. Экспертиза центра в области финансового просвещения и понимание аудитории позволили разработать материалы, которые действительно работают.",
  },
] as const;

export default async function RecommendationsPage() {
  const siteSetting = await fetchSiteSettings();

  return (
    <>
      <main>
        <section className="pt-8 md:pt-12">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
            <Button href="/" variant="ghost" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </section>

        <Section
          title="Рекомендации"
          lead="Что говорят о нас наши партнёры и клиенты"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {MOCK_TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.id}
                company={t.company}
                logoImg={t.logoImg}
                quote={t.quote}
                author={t.author}
                role={t.role}
              />
            ))}
          </div>
        </Section>
      </main>
      <Footer
        data={{
          organization: {
            fullName: siteSetting.organizationFullName,
            shortName: siteSetting.organizationShortName,
          },
          contacts: {
            phone: siteSetting.contactsPhone,
            email: siteSetting.contactsEmail,
            legalAddress: siteSetting.contactsLegalAddress ?? "",
          },
          social: siteSetting.socialLinks.map((l) => ({
            label: l.label,
            href: l.href,
          })),
          legalLinks: siteSetting.legalLinks.map((l) => ({
            label: l.label,
            href: l.href,
          })),
          legalDocuments: {
            title: siteSetting.legalDocumentsTitle ?? "Юридические документы",
            items: siteSetting.legalDocuments.map((d) => ({
              label: d.label,
              href: d.href,
              type: d.type,
            })),
          },
          copyright: {
            years: siteSetting.copyrightYears ?? "",
            text: siteSetting.copyrightText ?? "",
            notice: siteSetting.copyrightNotice ?? "",
          },
        }}
      />
    </>
  );
}
