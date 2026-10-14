"use client";

import { useEffect, useReducer, useRef, useState, type Dispatch } from "react";
import { useAnimate, useInView } from "motion/react";

import {
  useAutoplay,
  useDocumentVisible,
  useDesktopScene,
  useReducedMotion,
} from "@/shared/lib/motion";

import {
  initialPortraitState,
  nextPortrait,
  PORTRAIT_FADE_DURATION_MS,
  PORTRAIT_INTERVAL,
  PORTRAIT_LABELS,
  PORTRAIT_POOLS,
  portraitReducer,
  portraitSource,
  type PortraitAction,
  type PortraitSwap,
} from "../model/portraits";
import { SeasonOfferPortraitImage } from "./SeasonOfferPortraitImage";
import styles from "./season-offer-hero.module.css";

function PortraitFigure({ id, tall, priority = false }: { id: string; tall: boolean; priority?: boolean }) {
  return (
    <figure className={styles.portraitFigure}>
      <div className={styles.portraitVisual} data-portrait-visual>
        <SeasonOfferPortraitImage id={id} tall={tall} priority={priority} />
      </div>
      <figcaption className={styles.profession}>{PORTRAIT_LABELS[id]}</figcaption>
    </figure>
  );
}

function IncomingPortrait({
  swap,
  playing,
  reduceMotion,
  dispatch,
}: {
  swap: PortraitSwap;
  playing: boolean;
  reduceMotion: boolean;
  dispatch: Dispatch<PortraitAction>;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const animation = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      dispatch({ type: "complete", id: swap.id });
      return;
    }

    const outgoingFigure = scope.current.previousElementSibling;
    if (!(outgoingFigure instanceof HTMLElement)) {
      dispatch({ type: "complete", id: swap.id });
      return;
    }

    let active = true;
    // The decoded next frame stays opaque underneath. Only the outgoing
    // photo and its caption fade, so the card never exposes its background.
    const controls = animate(outgoingFigure, { opacity: [1, 0] }, {
      duration: PORTRAIT_FADE_DURATION_MS / 1000,
      ease: "easeInOut",
    });
    controls.pause();
    animation.current = controls;
    void controls.then(() => {
      if (active) dispatch({ type: "complete", id: swap.id });
    });

    return () => {
      active = false;
      controls.complete();
      animation.current = null;
    };
  }, [animate, dispatch, reduceMotion, scope, swap.id]);

  useEffect(() => {
    if (playing) animation.current?.play();
    // Settle on the next photo instead of freezing two overlapping faces.
    else animation.current?.complete();
  }, [playing, reduceMotion, swap.id]);

  return (
    <div ref={scope} className={styles.incoming} data-portrait-incoming={swap.id} aria-hidden="true">
      <PortraitFigure id={swap.id} tall={swap.slot === 0} />
    </div>
  );
}

export function SeasonOfferPortraits() {
  const [state, dispatch] = useReducer(portraitReducer, initialPortraitState);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const portraits = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const visible = useDocumentVisible();
  const desktop = useDesktopScene();
  const inView = useInView(portraits, { amount: 0.35 });
  const playing = desktop && !hovered && !focused && visible && inView && !reduceMotion;
  const nextId = nextPortrait(state)?.id;
  const ready = !!nextId && state.ready === nextId;

  useEffect(() => {
    if (!nextId || !desktop || !visible || !inView) return;
    let active = true;
    const image = new window.Image();
    image.src = portraitSource(nextId);
    // Slow or failed requests leave the current portrait visible. Cleanup
    // also prevents a stale request from committing after unmount or pause.
    void image.decode().then(
      () => { if (active) dispatch({ type: "loaded", id: nextId }); },
      () => { if (active) dispatch({ type: "failed", id: nextId }); }
    );
    return () => { active = false; };
  }, [nextId, desktop, visible, inView]);

  useAutoplay({
    enabled: playing && ready && !state.incoming,
    cycle: state.turn,
    duration: PORTRAIT_INTERVAL,
    onAdvance: () => dispatch({ type: "advance" }),
  });

  return (
    <div
      ref={portraits}
      className={styles.gallery}
      data-season-offer-gallery
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className={styles.portraits} role="group" aria-label="Сотрудники разных профессий" aria-live="off" tabIndex={0}>
        {PORTRAIT_POOLS.map((pool, slot) => (
          <div
            key={slot}
            className={`${styles.portrait} ${slot === 0 ? styles.tall : ""}`}
            data-portrait-slot={slot}
            data-portrait-current={pool[state.indices[slot]]}
          >
            <PortraitFigure key={pool[state.indices[slot]]} id={pool[state.indices[slot]]} tall={slot === 0} priority={slot === 0 && state.turn === 0} />
            {state.incoming?.slot === slot && (
              <IncomingPortrait
                key={state.incoming.id}
                swap={state.incoming}
                playing={playing}
                reduceMotion={reduceMotion}
                dispatch={dispatch}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
