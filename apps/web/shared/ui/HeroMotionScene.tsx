"use client";

import { m, scroll, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

import { useDesktopScene, useDocumentVisible, useReducedMotion } from "@/shared/lib/motion";

import { cn } from "@/shared/lib/cn";
import { HeroEntrance } from "./HeroEntrance";
import styles from "./hero-motion.module.css";
import type { HeroMotionSceneProps, HeroMotionStyle } from "./hero-motion.types";

// The scene changes composition around the original server-rendered content.
// Deck selection keeps its own Motion transforms on a different DOM layer.
export function HeroMotionScene({
  hero,
  children,
  missionDeck = false,
  sentinel = true,
  variant = "illustration",
  surfaceClassName,
}: HeroMotionSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const cardsUsed = useRef(false);
  const progressStart = useRef(0);
  const reduced = useReducedMotion();
  const desktop = useDesktopScene();
  const visible = useDocumentVisible();
  const inView = useInView(sceneRef, { margin: "120px 0px" });
  const progress = useMotionValue(0);
  const deck = useMotionValue(1);
  const artX = useTransform(progress, [0, 0.85, 1], [0, 72, 72]);
  const artY = useTransform(progress, [0, 0.8, 1], [0, -112, -112]);
  const artScale = useTransform(progress, [0, 0.15, 0.88, 1], [1, 1.04, 0.46, 0.46]);
  const artRotate = useTransform(progress, [0, 0.5, 1], [0, -5, 0]);
  const artOpacity = useTransform(progress, [0, 0.68, 0.94, 1], [1, 1, 0, 0]);
  const surfaceRadius = useTransform(progress, [0, 0.55, 1], [56, 32, 0]);
  const frontY = useTransform(deck, [0, 1], [104, 0]);
  const middleY = useTransform(deck, [0, 1], [152, 0]);
  const backY = useTransform(deck, [0, 1], [204, 0]);
  const frontRotate = useTransform(deck, [0, 1], [-6, 0]);
  const middleRotate = useTransform(deck, [0, 1], [5, 0]);
  const backRotate = useTransform(deck, [0, 1], [9, 0]);
  const mobileY = useTransform(deck, [0, 1], [48, 0]);
  const mobileScale = useTransform(deck, [0, 1], [0.96, 1]);
  const cardStyle: HeroMotionStyle = {
    "--home-front-y": frontY,
    "--home-middle-y": middleY,
    "--home-back-y": backY,
    "--home-front-rotate": frontRotate,
    "--home-middle-rotate": middleRotate,
    "--home-back-rotate": backRotate,
    "--home-mobile-y": mobileY,
    "--home-mobile-scale": mobileScale,
    "--home-surface-radius": surfaceRadius,
  };
  const photoY = useTransform(progress, [0, 1], [0, -72]);
  const photoScale = useTransform(progress, [0, 1], [1, 1.12]);
  const heroStyle: HeroMotionStyle = {
    "--home-photo-y": photoY,
    "--home-photo-scale": photoScale,
    "--home-art-x": artX,
    "--home-art-y": artY,
    "--home-art-scale": artScale,
    "--home-art-rotate": artRotate,
    "--home-art-opacity": artOpacity,
  };

  useEffect(() => {
    const scene = sceneRef.current;
    const heroNode = heroRef.current;
    const missionNode = missionRef.current;
    if (!scene || !heroNode || !missionNode) return;
    scene.dataset.enhanced = String(!reduced);

    let missionTop = 0;
    // Accessibility follows native scroll immediately, independently of Motion's frame.
    const syncHeroAccess = () => {
      const covered = !reduced && desktop && window.scrollY >= missionTop - 80;
      if (heroNode.inert !== covered) heroNode.inert = covered;
    };
    const measure = () => {
      const header = window.matchMedia("(min-width: 1024px)").matches ? 80 : 64;
      const top = Math.min(header, window.innerHeight - heroNode.offsetHeight - 16);
      heroNode.style.setProperty("--home-sticky-top", `${top}px`);
      missionTop = missionNode.getBoundingClientRect().top + window.scrollY;
      progressStart.current = Math.max(0, 1 - missionTop / window.innerHeight);
      syncHeroAccess();
    };
    const finishCards = () => { cardsUsed.current = true; deck.set(1); };
    const restoreHeroFocus = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement) || reduced || !desktop) return;
      if (event.target.getBoundingClientRect().bottom > missionNode.getBoundingClientRect().top) {
        window.scrollTo({ top: scene.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
      }
    };
    const revealHashTarget = () => {
      let hash: string;
      try { hash = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(hash);
      if (target && missionNode.contains(target)) finishCards();
    };
    measure();
    revealHashTarget();
    const resize = new ResizeObserver(measure);
    resize.observe(heroNode);
    resize.observe(missionNode);
    heroNode.addEventListener("focusin", restoreHeroFocus);
    missionNode.addEventListener("focusin", finishCards);
    missionNode.addEventListener("pointerdown", finishCards);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", syncHeroAccess, { passive: true });
    window.addEventListener("hashchange", revealHashTarget);
    window.addEventListener("popstate", finishCards);
    return () => {
      resize.disconnect();
      heroNode.inert = false;
      heroNode.removeEventListener("focusin", restoreHeroFocus);
      missionNode.removeEventListener("focusin", finishCards);
      missionNode.removeEventListener("pointerdown", finishCards);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", syncHeroAccess);
      window.removeEventListener("hashchange", revealHashTarget);
      window.removeEventListener("popstate", finishCards);
    };
  }, [deck, desktop, reduced]);

  useEffect(() => {
    const heroNode = heroRef.current;
    const missionNode = missionRef.current;
    if (!heroNode || !missionNode) return;
    if (reduced) {
      progress.set(0);
      deck.set(1);
      heroNode.inert = false;
      return;
    }
    if (!visible || !inView) return;

    const wideDeck = window.matchMedia("(min-width: 1280px)");
    let stopDeck: (() => void) | undefined;
    const connectDeck = () => {
      stopDeck?.();
      const target = missionNode.querySelector<HTMLElement>(wideDeck.matches ? "[data-mission-panel]" : "[data-mission-mobile-card]");
      if (!missionDeck || !target) return;
      if (target.getBoundingClientRect().top < window.innerHeight * 0.55) {
        cardsUsed.current = true;
      }
      stopDeck = scroll((value: number) => {
        const eased = 1 - (1 - value) ** 3;
        deck.set(cardsUsed.current ? 1 : eased);
      }, { target, offset: ["start end", "start 0.55"] });
    };
    connectDeck();
    wideDeck.addEventListener("change", connectDeck);
    const stopScene = scroll((value: number) => {
      const start = progressStart.current;
      progress.set(Math.max(0, Math.min(1, (value - start) / Math.max(0.01, 1 - start))));
    }, { target: missionNode, offset: ["start end", "start start"] });
    return () => {
      stopScene();
      stopDeck?.();
      wideDeck.removeEventListener("change", connectDeck);
    };
  }, [deck, desktop, inView, missionDeck, progress, reduced, visible]);

  return (
    <div ref={sceneRef} className={styles.scene} data-hero-motion-scene={variant} data-home-motion-scene={missionDeck || undefined}>
      <m.div ref={heroRef} className={styles.hero} style={heroStyle}>
        {missionDeck ? hero : <HeroEntrance compactOnly>{hero}</HeroEntrance>}
      </m.div>
      <m.div ref={missionRef} className={cn(styles.mission, surfaceClassName)} style={cardStyle}>
        {sentinel && <div data-header-hero-end aria-hidden="true" className={styles.sentinel} />}
        {children}
      </m.div>
    </div>
  );
}
