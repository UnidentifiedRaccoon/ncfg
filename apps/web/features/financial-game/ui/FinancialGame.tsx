"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { getOutcome, plans, players, preparationCost, reflections, responses, sessionBudget, sessionSteps } from "../model/negotiation";
import type { PlanId, Player, ResponseId, SessionPhase } from "../model/types";
import styles from "./financial-game.module.css";

const outcomes = plans.flatMap(plan => responses.map(response => getOutcome(plan.id, response.id)));
const outcomeMessages = [...new Set(outcomes.map(outcome => `${outcome.development} ${outcome.reserveComment}`))];
const planPrompt = "Выберите план. Здесь появится, что он означает для участников.";
const responsePrompt = "Сравните расходы и запас. Подготовка уже включена в расчёт.";
const reflectionPrompt = "Выберите тему — ведущий предложит вопрос для обсуждения.";
const sessionPlayers = Object.values(players);
const advanceLabels = ["Выбрать первый план", "Принять план", "Пересмотреть план", "К разбору", "Обсудить игру"];

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

// Hidden copies reserve intrinsic space at any width and font size. Only the
// current message is exposed to assistive technology; no fixed text height.
function SessionMessage({ text, messages, id }: { text: string; messages: readonly string[]; id: string }) {
  return <div className={styles.sessionMessage}>
    <p id={id} aria-live="polite">{text}</p>
    {messages.map(message => <p key={message} aria-hidden="true">{message}</p>)}
  </div>;
}

export function FinancialGame({ enquiryHref }: { enquiryHref: string }) {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>(0);
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [responseId, setResponseId] = useState<ResponseId | null>(null);
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const startHeading = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const sessionId = useId();
  const plan = plans.find(item => item.id === planId);
  const outcome = planId && responseId ? getOutcome(planId, responseId) : null;
  const reflection = reflections.find(item => item.id === reflectionId);
  // Unreached scenes still participate in layout, using valid representative data.
  const scenePlan = plan ?? plans[1];
  const sceneOutcome = outcome ?? getOutcome("pilot", "reduce");
  const outcomeText = `${sceneOutcome.development} ${sceneOutcome.reserveComment}`;
  const plannedCost = phase >= 3 && outcome ? outcome.spent : plan?.amount ?? 0;
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
      title: "Помогите партнёрам договориться",
      body: <>
        <p className={styles.sessionLead}>Анна и Михаил открывают мастерскую. Полный запуск стоит <strong>60</strong>, в резерве хотят оставить ещё <strong>60</strong>. Но бюджет — всего <strong>{sessionBudget} игровых единиц</strong>.</p>
        <div className={styles.sessionGoal}>
          <h4>Ваша цель — найти общий план</h4>
          <p>Вы принимаете решения за обоих игроков. Найдите план, который поможет начать дело и сохранить запас.</p>
        </div>
        <div className={styles.sessionInstructions}>
          <h4>Как играть</h4>
          <ol>
            <li><strong>Выберите первый план.</strong> Прочитайте реплики и нажмите на вариант — бюджет и реакции игроков обновятся.</li>
            <li><strong>Узнайте новое условие.</strong> Сравните расходы и пересмотрите решение.</li>
            <li><strong>Обсудите итог.</strong> Кому подходит план и о чём ещё нужно договориться?</li>
          </ol>
        </div>
      </>,
    },
    {
      title: "Какой план предложите?",
      body: <>
        <PlayerVoices />
        <div className={styles.proposalList} role="group" aria-label="Первый общий план">
          {plans.map(item => <button key={item.id} type="button" aria-pressed={planId === item.id} aria-controls={`${sessionId}-plan`} onClick={() => { setPlanId(item.id); setResponseId(null); setReflectionId(null); }}>
            <span><strong>{item.title}</strong><span>{item.amount} на запуск · {sessionBudget - item.amount} в резерве</span></span><Check size={18} aria-hidden="true" />
          </button>)}
        </div>
        <SessionMessage id={`${sessionId}-plan`} text={plan?.response ?? planPrompt} messages={[planPrompt, ...plans.map(item => item.response)]} />
      </>,
    },
    {
      title: "В расчёте не хватило одного условия",
      body: <>
        <p className={styles.sessionLead}>До открытия нужно подготовить помещение. Это ещё <strong>{preparationCost} игровых единиц</strong>, которых нет в первом плане.</p>
        <div className={styles.sessionCondition}>
          <span>Подготовка при любом запуске</span><strong>+{preparationCost}</strong>
        </div>
        <p className={styles.sessionPrompt}>Ведущий: «Договоры не подписаны, деньги не потрачены. Теперь можно вернуться к плану и пересмотреть его вместе».</p>
      </>,
    },
    {
      title: "О чём договоритесь теперь?",
      body: <>
        <PlayerVoices revised />
        <div className={styles.proposalList} role="group" aria-label="План после нового условия">
          {responses.map(item => {
            const result = getOutcome(scenePlan.id, item.id);
            const title = item.id === "continue" ? scenePlan.id === "wait" ? "Начать пилот" : "Запустить по плану" : item.id === "reduce" ? "Проверить предзаказы" : "Взять паузу";
            return <button key={item.id} type="button" aria-pressed={responseId === item.id} aria-controls={`${sessionId}-response`} onClick={() => { setResponseId(item.id); setReflectionId(null); }}>
              <span><strong>{title}</strong><span>{result.spent} с подготовкой · {result.reserve} остаётся</span></span><Check size={18} aria-hidden="true" />
            </button>;
          })}
        </div>
        <SessionMessage id={`${sessionId}-response`} text={outcome ? outcomeText : responsePrompt} messages={[responsePrompt, ...outcomeMessages]} />
      </>,
    },
    {
      title: "Что получилось в этом раунде?",
      body: <>
        <div className={styles.sessionResult}>
          <div><span>На дело</span><strong>{sceneOutcome.activityCost}</strong></div>
          <div><span>На подготовку</span><strong>{sceneOutcome.preparation}</strong></div>
          <div><span>Остаётся</span><strong>{sceneOutcome.reserve}</strong></div>
        </div>
        <SessionMessage id={`${sessionId}-outcome`} text={outcomeText} messages={outcomeMessages} />
        <h4 className={styles.reflectionHeading}>Что обсудите с ведущим?</h4>
        <div className={styles.reflectionChoices} role="group" aria-label="Тема для разбора с ведущим">
          {reflections.map(item => <button type="button" key={item.id} aria-pressed={reflectionId === item.id} aria-controls={`${sessionId}-reflection`} onClick={() => setReflectionId(item.id)}>{item.title}<ArrowRight size={16} aria-hidden="true" /></button>)}
        </div>
        <SessionMessage id={`${sessionId}-reflection`} text={reflection?.text ?? reflectionPrompt} messages={[reflectionPrompt, ...reflections.map(item => item.text)]} />
      </>,
    },
  ];

  return <div className={`${styles.trialBoard} ${styles.dialogueBoard}`} data-started={started}>
    <div className={styles.sessionBackdrop} aria-hidden="true">
      <Image src="/services/financial-games/workshop-start.webp" alt="" width={1672} height={941} loading="lazy" unoptimized />
    </div>
    <div className={styles.sessionScreens}>
      <div className={styles.sessionStart} data-active={!started} inert={started} aria-hidden={started}>
        <h3 ref={startHeading} tabIndex={-1}>Анна и Михаил открывают мастерскую. Помогите им договориться</h3>
        <Button type="button" className={styles.eventButton} onClick={start}>Начать игру<ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
      <div className={styles.sessionGame} data-active={started} inert={!started} aria-hidden={!started}>
        <div className={styles.sessionHeader}>
          <ol className={styles.sessionProgress} aria-label="Ход игры">
            {sessionSteps.map((step, index) => <li key={step} aria-label={step} aria-current={phase === index ? "step" : undefined} data-complete={phase > index}>
              <span aria-hidden="true">{phase > index ? <Check size={14} /> : index + 1}</span><span className={styles.sessionStepName}>{step}</span>
            </li>)}
          </ol>
          <button type="button" className={styles.sessionReset} onClick={reset} aria-label="Начать заново"><RotateCcw size={17} aria-hidden="true" /><span>Заново</span></button>
        </div>
        <p className={styles.sessionStepCaption} aria-live="polite">Шаг {phase + 1} из {sessionSteps.length} · {sessionSteps[phase]}</p>

        <div className={styles.sessionWorkspace}>
          <aside className={styles.sessionContext} aria-label="Игроки и бюджет мастерской">
            <div className={styles.sessionParticipants}>
              {sessionPlayers.map(player => <div key={player.id}>
                <PlayerIdentity player={player} />
                <p>{player.motivation}</p>
              </div>)}
            </div>
            <div className={styles.sessionBudget}>
              <strong>Общий бюджет</strong>
              <dl><div><dt>Всего</dt><dd>{sessionBudget}</dd></div><div><dt>Расходы</dt><dd>{plannedCost}</dd></div><div><dt>Остаётся</dt><dd>{sessionBudget - plannedCost}</dd></div></dl>
              <p>{phase === 4 ? "Итог раунда" : phase >= 3 && outcome ? "Новый план" : plan ? "Первый план" : "Деньги ещё не распределены"}. Игровые единицы.</p>
            </div>
          </aside>

          <div className={styles.sessionPlay}>
            <div className={styles.sessionSceneStack}>
              {scenes.map((scene, index) => <section key={index} className={styles.sessionScene} data-phase={index} data-active={started && phase === index} inert={!started || phase !== index} aria-hidden={!started || phase !== index} aria-labelledby={`${sessionId}-scene-${index}`}>
                <h3 id={`${sessionId}-scene-${index}`} ref={element => { headings.current[index] = element; }} tabIndex={-1}>{scene.title}</h3>
                <div className={styles.sessionSceneBody}>{scene.body}</div>
              </section>)}
            </div>
            <div className={styles.sessionControls}>
              <Button type="button" variant="ghost" className={styles.sessionBack} onClick={() => phase === 0 ? setStarted(false) : goTo(phase === 4 ? 3 : phase === 3 ? 2 : phase === 2 ? 1 : 0)}><ArrowLeft size={16} aria-hidden="true" />Назад</Button>
              {phase === 4
                ? <Button href={enquiryHref} className={styles.eventButton}>{advanceContent}</Button>
                : <Button type="button" className={styles.eventButton} disabled={(phase === 1 && !plan) || (phase === 3 && !outcome)} onClick={advance}>{advanceContent}</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
    <noscript><p className={styles.trialNote}>Для участия в игре включите JavaScript. Описание настольных игр доступно ниже.</p></noscript>
  </div>;
}
