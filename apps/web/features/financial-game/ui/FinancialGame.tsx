"use client";

import { m } from "motion/react";
import { contentTransition, motionTokens, useCompactMotion, useReducedMotion } from "@/shared/lib/motion";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { getOutcome, plans, players, preparationCost, reflections, responses, sessionBudget, sessionSteps } from "../model/negotiation";
import type { PlanId, Player, ResponseId, SessionPhase } from "../model/types";
import styles from "./financial-game.module.css";

const outcomes = plans.flatMap(plan => responses.map(response => getOutcome(plan.id, response.id)));
const outcomeMessages = [...new Set(outcomes.map(outcome => `${outcome.development} ${outcome.reserveComment}`))];
const sessionPlayers = Object.values(players);
const advanceLabels = ["Выбрать план", "Принять план", "Пересмотреть план", "К разбору", "Обсудить игру"];

function PlayerIdentity({ player }: { player: Player }) {
  return <div className={styles.playerIdentity}>
    <span className={styles.playerMarker} data-player={player.id} aria-hidden="true">{player.number}</span>
    <div>
      <strong className={styles.playerName}>{player.name}</strong>
      <span className={styles.playerRole}>Игрок {player.number} · {player.priority}</span>
    </div>
  </div>;
}

function PlayerVoices({ revised = false }: { revised?: boolean }) {
  return <div className={styles.sessionVoices}>
    {sessionPlayers.map(player => <div key={player.id}>
      <PlayerIdentity player={player} />
      <p>«{revised ? player.revisedProposal : player.firstProposal}»</p>
    </div>)}
  </div>;
}

function BudgetSummary({ spent, id }: { spent: number; id: string }) {
  return <div className={styles.sessionBudget} id={id} role="group" aria-label="Общий бюджет">
    <strong aria-hidden="true">Общий бюджет</strong>
    <dl aria-live="polite" aria-atomic="true">
      <div><dt>Всего</dt><dd>{sessionBudget}</dd></div>
      <div><dt>Расходы</dt><dd>{spent}</dd></div>
      <div><dt>Остаётся</dt><dd>{sessionBudget - spent}</dd></div>
    </dl>
  </div>;
}

// Desktop reserves space for every message; mobile fits only the current copy.
// Hidden copies are never exposed to assistive technology.
function SessionMessage({ text, messages, id }: { text: string; messages: readonly string[]; id: string }) {
  return <div className={styles.sessionMessage} data-empty={!text}>
    <p id={id} aria-live="polite">{text}</p>
    {messages.map(message => <p key={message} aria-hidden="true">{message}</p>)}
  </div>;
}

export function FinancialGame({ enquiryHref }: { enquiryHref: string }) {
  const reduced = useReducedMotion();
  const compact = useCompactMotion();
  const stepDistance = reduced ? 0 : compact ? motionTokens.compactStepDistance : motionTokens.stepDistance;
  const transition = contentTransition(reduced);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>(0);
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [responseId, setResponseId] = useState<ResponseId | null>(null);
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const startHeading = useRef<HTMLHeadingElement>(null);
  const welcomeScreen = useRef<HTMLDivElement>(null);
  const gameScreen = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const sessionId = useId();
  const plan = plans.find(item => item.id === planId);
  const outcome = planId && responseId ? getOutcome(planId, responseId) : null;
  const reflection = reflections.find(item => item.id === reflectionId);
  // Unreached scenes still participate in layout, using valid representative data.
  const scenePlan = plan ?? plans[1];
  const sceneOutcome = outcome ?? getOutcome("pilot", "reduce");
  const outcomeText = `${sceneOutcome.development} ${sceneOutcome.reserveComment}`;
  // Reserve the tallest caption when a narrow screen wraps a button label.
  const advanceContent = <>
    <span className={styles.sessionActionLabel}>
      <span>{advanceLabels[phase]}</span>
      {advanceLabels.map(label => <span key={label} aria-hidden="true">{label}</span>)}
    </span>
    <ArrowRight size={17} aria-hidden="true" />
  </>;

  useEffect(() => {
    if (!interacted.current) return;
    const heading = started ? headings.current[phase] : startHeading.current;
    heading?.focus({ preventScroll: true });

    const screen = started ? gameScreen.current : welcomeScreen.current;
    const frame = window.requestAnimationFrame(() => {
      const bounds = heading?.getBoundingClientRect();
      const headerSpace = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const headingVisible = bounds && bounds.top >= headerSpace && bounds.bottom <= window.innerHeight;
      if (!window.matchMedia("(max-width: 760px)").matches && headingVisible) return;

      screen?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [phase, started]);

  function start() {
    interacted.current = true;
    setStarted(true);
  }

  function goTo(next: SessionPhase) {
    interacted.current = true;
    setPhase(next);
  }

  function reset() {
    setStarted(false);
    setPlanId(null);
    setResponseId(null);
    setReflectionId(null);
    goTo(0);
  }

  function advance() {
    if (phase === 0) goTo(1);
    else if (phase === 1 && plan) goTo(2);
    else if (phase === 2) goTo(3);
    else if (phase === 3 && outcome) goTo(4);
  }

  const scenes = [
    {
      title: "Познакомьтесь с игроками",
      body: <>
        <p className={styles.sessionLead}>Вы принимаете решения за обоих игроков. Нужно начать дело и сохранить запас, уложившись в <strong>{sessionBudget} игровых единиц</strong>.</p>
        <div className={styles.sessionParticipants}>
          {sessionPlayers.map(player => <div key={player.id}>
            <PlayerIdentity player={player} />
            <p>{player.motivation}</p>
          </div>)}
        </div>
        <div className={styles.sessionInstructions}>
          <h4>Как играть</h4>
          <p>Выберите общий план. Когда появится новое условие, пересмотрите его и обсудите итог.</p>
        </div>
      </>,
    },
    {
      title: "Какой план предложите?",
      body: <>
        <BudgetSummary spent={plan?.amount ?? 0} id={`${sessionId}-first-budget`} />
        <PlayerVoices />
        <div className={styles.proposalList} role="group" aria-label="Первый общий план">
          {plans.map(item => <button key={item.id} type="button" aria-pressed={planId === item.id} aria-controls={`${sessionId}-plan`} onClick={() => { setPlanId(item.id); setResponseId(null); setReflectionId(null); }}>
            <span><strong>{item.title}</strong><span>{item.amount} на запуск · {sessionBudget - item.amount} в резерве</span></span><Check size={18} aria-hidden="true" />
          </button>)}
        </div>
        <SessionMessage id={`${sessionId}-plan`} text={plan?.response ?? ""} messages={plans.map(item => item.response)} />
      </>,
    },
    {
      title: "В расчёте не хватило одного условия",
      body: <>
        <BudgetSummary spent={scenePlan.amount} id={`${sessionId}-condition-budget`} />
        <p className={styles.sessionLead}>Перед открытием нужно подготовить помещение. Этот расход не вошёл в первый план.</p>
        <div className={styles.sessionCondition}>
          <span>Подготовка помещения</span><strong>+{preparationCost}</strong>
        </div>
        <p className={styles.sessionPrompt}>Деньги ещё не потрачены — план можно пересмотреть.</p>
      </>,
    },
    {
      title: "О чём договоритесь теперь?",
      body: <>
        <BudgetSummary spent={outcome?.spent ?? scenePlan.amount} id={`${sessionId}-response`} />
        <PlayerVoices revised />
        <div className={styles.proposalList} role="group" aria-label="План после нового условия">
          {responses.map(item => {
            const result = getOutcome(scenePlan.id, item.id);
            const title = item.id === "continue" ? scenePlan.id === "wait" ? "Начать пилот" : "Запустить по плану" : item.id === "reduce" ? "Проверить предзаказы" : "Взять паузу";
            return <button key={item.id} type="button" aria-pressed={responseId === item.id} aria-controls={`${sessionId}-response`} onClick={() => { setResponseId(item.id); setReflectionId(null); }}>
              <span><strong>{title}</strong><span>{result.spent} с подготовкой · {result.reserve} остаётся</span></span><Check size={18} aria-hidden="true" />
            </button>;
          })}
        </div>
      </>,
    },
    {
      title: "Что получилось в этом раунде?",
      body: <>
        <div className={styles.sessionResult}>
          <div><span>На дело</span><strong>{sceneOutcome.activityCost}</strong></div>
          <div><span>На подготовку</span><strong>{sceneOutcome.preparation}</strong></div>
          <div><span>Остаётся</span><strong>{sceneOutcome.reserve}</strong></div>
        </div>
        <SessionMessage id={`${sessionId}-outcome`} text={outcomeText} messages={outcomeMessages} />
        <h4 className={styles.reflectionHeading}>Что обсудите с ведущим?</h4>
        <div className={styles.reflectionChoices} role="group" aria-label="Тема для разбора с ведущим">
          {reflections.map(item => <button type="button" key={item.id} aria-pressed={reflectionId === item.id} aria-controls={`${sessionId}-reflection`} onClick={() => setReflectionId(item.id)}>{item.title}<ArrowRight size={16} aria-hidden="true" /></button>)}
        </div>
        <SessionMessage id={`${sessionId}-reflection`} text={reflection?.text ?? ""} messages={reflections.map(item => item.text)} />
      </>,
    },
  ];

  return <div className={`${styles.trialBoard} ${styles.dialogueBoard}`} data-started={started}>
    <m.div initial={false} animate={{ opacity: started ? 0 : 1 }} transition={transition} className={styles.sessionBackdrop} aria-hidden="true">
      <Image src="/services/financial-games/workshop-start.webp" alt="" width={1672} height={941} loading="lazy" unoptimized />
    </m.div>
    <div className={styles.sessionScreens}>
      <div ref={welcomeScreen} className={styles.sessionStart} data-active={!started} inert={started} aria-hidden={started}>
        <h3 ref={startHeading} tabIndex={-1}>Анна и Михаил открывают мастерскую. Помогите им договориться</h3>
        <Button type="button" className={styles.eventButton} onClick={start}>Начать игру<ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
      <m.div initial={false} animate={{ opacity: started ? 1 : 0 }} transition={transition} ref={gameScreen} className={styles.sessionGame} data-active={started} inert={!started} aria-hidden={!started}>
        <div className={styles.sessionHeader}>
          <ol className={styles.sessionProgress} aria-label="Ход игры">
            {sessionSteps.map((step, index) => <li key={step} aria-label={step} aria-current={phase === index ? "step" : undefined} data-complete={phase > index}>
              <span aria-hidden="true">{phase > index ? <Check size={14} /> : index + 1}</span><span className={styles.sessionStepName}>{step}</span>
            </li>)}
          </ol>
          <p className={styles.sessionStepCaption}>Шаг {phase + 1} из {sessionSteps.length} · {sessionSteps[phase]}</p>
          <button type="button" className={styles.sessionReset} onClick={reset} aria-label="Начать заново"><RotateCcw size={17} aria-hidden="true" /><span>Заново</span></button>
        </div>
        <div className={styles.sessionPlay}>
          <div className={styles.sessionSceneStack}>
            {scenes.map((scene, index) => <m.section initial={false} animate={{
              opacity: started && phase === index ? 1 : 0,
              x: phase === index ? 0 : index < phase ? -stepDistance : stepDistance,
            }} transition={{ duration: reduced || !started || phase !== index ? 0 : motionTokens.step, ease: motionTokens.ease }} key={index} className={styles.sessionScene} data-phase={index} data-active={started && phase === index} inert={!started || phase !== index} aria-hidden={!started || phase !== index} aria-labelledby={`${sessionId}-scene-${index}`}>
              <h3 id={`${sessionId}-scene-${index}`} ref={element => { headings.current[index] = element; }} tabIndex={-1}>{scene.title}</h3>
              <div className={styles.sessionSceneBody}>{scene.body}</div>
            </m.section>)}
          </div>
          <div className={styles.sessionControls}>
            <Button type="button" variant="ghost" className={styles.sessionBack} onClick={() => phase === 0 ? setStarted(false) : goTo(phase === 4 ? 3 : phase === 3 ? 2 : phase === 2 ? 1 : 0)}><ArrowLeft size={16} aria-hidden="true" />Назад</Button>
            {phase === 4
              ? <Button href={enquiryHref} className={styles.eventButton}>{advanceContent}</Button>
              : <Button type="button" className={styles.eventButton} disabled={(phase === 1 && !plan) || (phase === 3 && !outcome)} onClick={advance}>{advanceContent}</Button>}
          </div>
        </div>
      </m.div>
    </div>
    <noscript><p className={styles.trialNote}>Для участия в игре включите JavaScript. Описание настольных игр доступно ниже.</p></noscript>
  </div>;
}
