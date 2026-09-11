import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, Users, Plus } from "lucide-react";
import { ASSET_PATH, exercise, games, meetingSteps, sources } from "./content";
import { Button } from "@/shared/ui/Button";
import { Section } from "@/shared/ui/Section";
import { FinancialGame } from "@/features/financial-game";
import styles from "./financial-games.module.css";

function GamePhoto({ name, alt, caption, className = "", priority = false }: {
  name: string; alt: string; caption?: string; className?: string; priority?: boolean;
}) {
  const isGenerated = name === "game-company.webp";
  const isChildren = name === "kids-board.jpg";
  return <figure className={`${styles.photo} ${className}`}>
    <Image
      src={`${ASSET_PATH}/${name}`}
      alt={alt}
      width={isGenerated ? 1672 : isChildren ? 1440 : 800}
      height={isGenerated ? 941 : isChildren ? 1032 : 600}
      priority={priority}
      unoptimized={isGenerated}
      sizes={priority ? "100vw" : "(max-width: 760px) 100vw, 50vw"}
    />
    {caption && !isGenerated ? <figcaption>{caption} · <a href={isChildren ? sources.children : sources.adult} target="_blank" rel="noreferrer">Материалы «Игрики» <ArrowUpRight size={12} aria-hidden="true" /></a></figcaption> : null}
  </figure>;
}

function Action({ label = "Обсудить проведение игры" }: { label?: string }) {
  return <Button href="#lead-form" className={styles.gameAction} data-ym-goal="cta_click">{label}<ArrowUpRight size={18} aria-hidden="true" /></Button>;
}

function LandingHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroStage}>
        <div className={styles.heroTop}>
          <h1>Увидеть возможности<br /><span>Сделать первый ход</span></h1>
          <div className={styles.heroDescription}>
            <p>Финансовые игры для сотрудников и их детей. Пробуйте стратегии, договаривайтесь и обсуждайте решения с консультантами НЦФГ.</p>
            <div className={styles.heroActions}>
              <Action label="Обсудить проведение" />
              <Button variant="ghost" className={styles.heroSecondary} href="#trial-move">{exercise.action}<ArrowDown size={18} aria-hidden="true" /></Button>
            </div>
          </div>
        </div>
        <GamePhoto
          name="game-company.webp"
          alt="Коллеги обсуждают ход за столом с полем, карточками и фишками финансовой игры"
          className={styles.heroBanner}
          priority
        />
      </div>
    </section>
  );
}

function GameExercise() {
  return (
    <Section
      id="trial-move"
      title={exercise.title}
      lead={exercise.description}
      reveal={false}
      className={styles.trial}
      containerClassName="px-0 md:px-0 lg:px-0"
    >
      <FinancialGame enquiryHref="#lead-form" />
    </Section>
  );
}

function GameDetails({ kind }: { kind: "adult" | "children" }) {
  const game = games[kind];
  return <section id={game.id} className={`${styles.gameSection} ${kind === "children" ? styles.childrenSection : ""}`} aria-labelledby={`${game.id}-title`}>
    <div className={styles.gameHeading}><h2 id={`${game.id}-title`}>{game.audience}</h2><span>Настольная игра с ведущим</span></div>
    <div className={styles.gameContent}>
      <GamePhoto name={game.image} alt={game.alt} caption={kind === "adult" ? "Детали бизнес-тренажёра" : "Поле детской игры"} />
      <div className={styles.gameCopy}>
        <h3>{game.title}</h3><p>{game.description}</p>
        <ul className={styles.facts}><li><Users size={19} aria-hidden="true" />{game.people}</li><li><Clock3 size={19} aria-hidden="true" />{game.duration}</li></ul>
        <p className={styles.gameDetail}>{game.detail}</p>
        <ul className={styles.topicList}>{game.topics.map(topic => <li key={topic}><ArrowRight size={16} aria-hidden="true" />{topic}</li>)}</ul>
        <a href="#lead-form" className={styles.textLink}>Обсудить этот формат <ArrowUpRight size={18} aria-hidden="true" /></a>
        {kind === "adult" ? <details className={styles.rules}><summary>Какова цель игры?<Plus size={16} aria-hidden="true" /></summary><p>За пять игровых часов добиться доминирования в одной из сфер игрового государства: политике, культуре, силе, экономике или влиянии. Игровая цель и длительность встречи — разные параметры.</p></details> : null}
      </div>
    </div>
  </section>;
}

function Meeting() {
  return <section id="meeting" className={styles.meeting}>
    <h2>Как проходит игра</h2>
    <div>
      <ol className={styles.steps}>{meetingSteps.map((step, index) => <li key={step.title}><span className={styles.stepNumber}>{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
    </div>
  </section>;
}

function Hosting() {
  return <section className={styles.hosting}>
    <div><h2>Игру ведёт НЦФГ</h2><p>В рамках соглашения с «Игрикой» финансовые консультанты и игропрактики НЦФГ проводят игры из линейки издателя.</p><p>Ведущий помогает разобраться в правилах и сопровождает игровой процесс. Формат встречи обсуждаем с учётом вашей аудитории.</p></div>
    <div className={styles.multipleTables}><Users size={36} strokeWidth={1.3} aria-hidden="true" /><h3>Большая команда?<br />Несколько игровых столов.</h3><p>Для компании игру могут проводить сразу несколько консультантов. Количество столов и ведущих согласуем под вашу группу.</p><a className={styles.textLink} href="#lead-form">Обсудить число участников <ArrowUpRight size={18} aria-hidden="true" /></a></div>
  </section>;
}

function OtherGames() {
  return <section id="other-games" className={styles.otherGames}><h2>Другие игры</h2><div><h3>Денежный поток олигарха</h3><p>Ещё одна игра линейки «Игрика». Если вас интересует этот формат, расскажите об этом в заявке — обсудим возможность проведения.</p></div><a href="#lead-form" className={styles.textLink}>Узнать о проведении <ArrowUpRight size={18} aria-hidden="true" /></a></section>;
}

export function FinancialGamesLanding() {
  return <div className={styles.theme}>
    <LandingHero />
    <div className={styles.pageContainer}>
      <GameExercise />
      <GameDetails kind="adult" />
      <GameDetails kind="children" />
      <Meeting />
      <Hosting />
      <OtherGames />
    </div>
  </div>;
}
