"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { seasonOffer2026Content } from "@/widgets/SeasonOffer2026";

import styles from "./seasonal-offer-hero.module.css";

const VARIANTS = [
  { id: "people", label: "Люди" },
  { id: "wellbeing", label: "Опора" },
  { id: "typographic", label: "Типографика" },
  { id: "hybrid", label: "Синтез" },
  { id: "focus", label: "Фокус" },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

const HYBRID_THEMES = [
  {
    id: "cool",
    label: "Сине-зелёный",
    shortLabel: "База",
    landscape:
      "/experiments/seasonal-offer-hero/wellbeing-split-landscape-v3.jpg",
    portrait: "/experiments/seasonal-offer-hero/wellbeing-split-portrait-v3.jpg",
    swatchClassName: styles.hybridThemeSwatchCool,
  },
  {
    id: "warm",
    label: "Тёплый зелёный и золото",
    shortLabel: "Тёплый",
    landscape:
      "/experiments/seasonal-offer-hero/wellbeing-warm-green-gold-landscape-v1.jpg",
    portrait:
      "/experiments/seasonal-offer-hero/wellbeing-warm-green-gold-portrait-v1.jpg",
    swatchClassName: styles.hybridThemeSwatchWarm,
  },
  {
    id: "blueGold",
    label: "Синий и золото",
    shortLabel: "Золото",
    landscape:
      "/experiments/seasonal-offer-hero/wellbeing-blue-gold-landscape-v1.jpg",
    portrait:
      "/experiments/seasonal-offer-hero/wellbeing-blue-gold-portrait-v1.jpg",
    swatchClassName: styles.hybridThemeSwatchBlueGold,
  },
] as const;

type HybridThemeId = (typeof HYBRID_THEMES)[number]["id"];

const PORTRAITS = [
  { id: "leaders", atlasIndex: 0, label: "Руководитель" },
  { id: "learning", atlasIndex: 1, label: "L&D-менеджер" },
  { id: "marketing", atlasIndex: 2, label: "Маркетолог" },
  { id: "people", atlasIndex: 3, label: "HR-менеджер" },
  { id: "specialists", atlasIndex: 4, label: "Аналитик" },
  { id: "office", atlasIndex: 5, label: "Бухгалтер" },
  { id: "production", atlasIndex: 6, label: "Инженер" },
  { id: "sales", atlasIndex: 7, label: "Продавец" },
  { id: "service", atlasIndex: 8, label: "Консультант" },
] as const;

const PORTRAIT_POSITIONS = [
  styles.portraitOne,
  styles.portraitTwo,
  styles.portraitThree,
  styles.portraitFour,
  styles.portraitFive,
  styles.portraitSix,
] as const;

const PORTRAIT_PHASES = [
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 6, 7, 8],
  [3, 4, 5, 6, 7, 8],
  [3, 4, 5, 0, 1, 2],
  [6, 7, 8, 0, 1, 2],
  [6, 7, 8, 3, 4, 5],
] as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const CTA_HREF = "/companies/season-offer-2026#season-offer-lead";
const PEOPLE_FOCUS_BACKDROPS = {
  landscape:
    "/experiments/seasonal-offer-hero/people-focus-blurred-landscape-v1.jpg",
  portrait: "/experiments/seasonal-offer-hero/people-focus-blurred-portrait-v1.jpg",
} as const;

function PortraitCrop({ atlasIndex }: { atlasIndex: number }) {
  return (
    <div className={styles.portraitCrop}>
      <Image
        src="/experiments/seasonal-offer-hero/people-atlas-v2.png"
        alt=""
        width={1254}
        height={1254}
        priority
        sizes="(min-width: 1024px) 36vw, (min-width: 721px) 66vw, 126vw"
        className={`${styles.portraitAtlas} ${styles[`atlas${atlasIndex}`]}`}
      />
    </div>
  );
}

function HeroAction({
  className,
  reduceMotion,
}: {
  className: string;
  reduceMotion: boolean;
}) {
  return (
    <motion.a
      layoutId={reduceMotion ? undefined : "seasonal-offer-primary-action"}
      href={CTA_HREF}
      className={className}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { y: 2, scale: 0.985 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: EASE }}
    >
      <span>{seasonOffer2026Content.hero.primaryAction.label}</span>
      <ArrowUpRight aria-hidden="true" />
    </motion.a>
  );
}

function PeopleHero({
  reduceMotion,
  mode = "plain",
}: {
  reduceMotion: boolean;
  mode?: "plain" | "focus";
}) {
  const hero = seasonOffer2026Content.hero;
  const isFocusVariant = mode === "focus";
  const titleId = isFocusVariant ? "focus-hero-title" : "people-hero-title";
  const carouselId = isFocusVariant
    ? "focus-professions-carousel"
    : "people-professions-carousel";
  const carouselHintId = `${carouselId}-hint`;
  const [portraitPhase, setPortraitPhase] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselCycleWidthRef = useRef(0);
  const carouselPausedUntilRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const desktopViewport = window.matchMedia("(min-width: 1024px)");
    let interval: number | undefined;

    const syncDesktopRotation = () => {
      if (interval) window.clearInterval(interval);
      interval = undefined;

      if (desktopViewport.matches) {
        interval = window.setInterval(() => {
          setPortraitPhase((current) => (current + 1) % PORTRAIT_PHASES.length);
        }, 3600);
      }
    };

    syncDesktopRotation();
    desktopViewport.addEventListener("change", syncDesktopRotation);

    return () => {
      if (interval) window.clearInterval(interval);
      desktopViewport.removeEventListener("change", syncDesktopRotation);
    };
  }, [reduceMotion]);

  useEffect(() => {
    const track = carouselRef.current;
    if (!track) return;

    const carouselViewport = window.matchMedia("(max-width: 1023px)");
    let autoplayInterval: number | undefined;
    let previousTime = performance.now();

    const measureCycle = () => {
      const cycleStarts = track.querySelectorAll<HTMLElement>("[data-carousel-cycle-start]");
      if (cycleStarts.length < 2) return;

      const previousCycleWidth = carouselCycleWidthRef.current;
      const nextCycleWidth =
        cycleStarts[1].getBoundingClientRect().left -
        cycleStarts[0].getBoundingClientRect().left;

      if (nextCycleWidth <= 0) return;

      const phase = previousCycleWidth
        ? (((track.scrollLeft - previousCycleWidth) % previousCycleWidth) +
            previousCycleWidth) %
          previousCycleWidth
        : 0;

      carouselCycleWidthRef.current = nextCycleWidth;
      track.scrollLeft =
        nextCycleWidth +
        (previousCycleWidth ? (phase / previousCycleWidth) * nextCycleWidth : 0);
    };

    const tick = () => {
      const currentTime = performance.now();
      const delta = Math.min(currentTime - previousTime, 1000);
      previousTime = currentTime;

      if (
        document.visibilityState === "visible" &&
        currentTime >= carouselPausedUntilRef.current
      ) {
        const cycleWidth = carouselCycleWidthRef.current;

        if (cycleWidth > 0) {
          if (track.scrollLeft >= cycleWidth * 2) track.scrollLeft -= cycleWidth;
          if (track.scrollLeft < cycleWidth * 0.35) track.scrollLeft += cycleWidth;
          track.scrollLeft += delta * 0.02;
        }
      }
    };

    const syncAutoplay = () => {
      if (autoplayInterval) window.clearInterval(autoplayInterval);
      autoplayInterval = undefined;

      if (!carouselViewport.matches) return;

      measureCycle();
      previousTime = performance.now();

      if (!reduceMotion) autoplayInterval = window.setInterval(tick, 32);
    };

    const resetAutoplayClock = () => {
      previousTime = performance.now();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (carouselViewport.matches) measureCycle();
    });
    resizeObserver.observe(track);
    carouselViewport.addEventListener("change", syncAutoplay);
    document.addEventListener("visibilitychange", resetAutoplayClock);
    syncAutoplay();

    return () => {
      if (autoplayInterval) window.clearInterval(autoplayInterval);
      resizeObserver.disconnect();
      carouselViewport.removeEventListener("change", syncAutoplay);
      document.removeEventListener("visibilitychange", resetAutoplayClock);
    };
  }, [reduceMotion]);

  const activePortraits = PORTRAIT_PHASES[portraitPhase].map(
    (portraitIndex) => PORTRAITS[portraitIndex]
  );
  const stopCarouselAutoplay = () => {
    carouselPausedUntilRef.current = Number.POSITIVE_INFINITY;
  };

  return (
    <section
      className={`${styles.peopleHero} ${isFocusVariant ? styles.peopleFocusHero : ""}`}
      aria-labelledby={titleId}
      data-visual-mode={mode}
    >
      {isFocusVariant ? (
        <motion.div
          className={styles.peopleFocusBackdrop}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.92, ease: EASE }}
          aria-hidden="true"
        >
          <picture className={styles.peopleFocusPicture}>
            <source
              media="(max-width: 720px), (max-width: 1023px) and (orientation: portrait)"
              srcSet={PEOPLE_FOCUS_BACKDROPS.portrait}
            />
            <img
              src={PEOPLE_FOCUS_BACKDROPS.landscape}
              alt=""
              width={1672}
              height={941}
              decoding="async"
              fetchPriority="high"
              className={styles.peopleFocusImage}
            />
          </picture>
        </motion.div>
      ) : null}

      <p className={`${styles.srOnly} ${styles.peopleDesktopDescription}`}>
        Программа подходит руководителям, L&amp;D-менеджерам, маркетологам,
        HR-менеджерам, аналитикам, бухгалтерам, инженерам, продавцам и консультантам.
      </p>

      <div className={styles.peoplePortraitsDesktop} aria-hidden="true">
        {activePortraits.map((portrait, slotIndex) => (
          <div
            className={`${styles.portraitSlot} ${PORTRAIT_POSITIONS[slotIndex]}`}
            key={`desktop-slot-${slotIndex}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.figure
                key={portrait.id}
                className={styles.peoplePortrait}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.86,
                        y: slotIndex % 2 === 0 ? 22 : -22,
                        filter: "blur(10px)",
                      }
                }
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  y: slotIndex % 2 === 0 ? -16 : 16,
                  filter: "blur(8px)",
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.58,
                  delay: reduceMotion ? 0 : slotIndex * 0.035,
                  ease: EASE,
                }}
              >
                <PortraitCrop atlasIndex={portrait.atlasIndex} />
                <figcaption>{portrait.label}</figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className={styles.peopleContent}>
        <h1 id={titleId} className={styles.peopleHeadline}>
          {[
            { text: "Финансовое ", accent: "благополучие" },
            { text: "сотрудников —", accent: "" },
            { text: "", accent: "без роста ФОТ" },
          ].map((line, index) => (
            <span
              className={`${styles.lineClip} ${styles.fixedHeadlineLine}`}
              key={`${line.text}${line.accent}`}
            >
              <motion.span
                initial={reduceMotion ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.68, delay: 0.08 + index * 0.07, ease: EASE }}
              >
                {line.text}
                {line.accent ? (
                  <span className={styles.peopleHeadlineAccent}>{line.accent}</span>
                ) : null}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className={styles.peopleLead}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.24, ease: EASE }}
        >
          {hero.lead}
        </motion.p>

        <motion.div
          className={styles.peopleActions}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.3, ease: EASE }}
        >
          <HeroAction className={styles.peopleCta} reduceMotion={reduceMotion} />
        </motion.div>
      </div>

      <div
        className={styles.peopleCarousel}
        role="region"
        aria-roledescription="карусель"
        aria-label="Автопрокручиваемая галерея профессий участников программы"
        aria-describedby={carouselHintId}
      >
        <p id={carouselHintId} className={styles.srOnly}>
          Автопрокрутка останавливается после касания, ручной прокрутки или
          клавиатурного фокуса на галерее.
        </p>
        <div
          ref={carouselRef}
          id={carouselId}
          className={styles.peopleCarouselTrack}
          role="list"
          aria-live="off"
          tabIndex={0}
          onPointerDown={stopCarouselAutoplay}
          onPointerUp={stopCarouselAutoplay}
          onPointerCancel={stopCarouselAutoplay}
          onWheel={stopCarouselAutoplay}
          onFocus={stopCarouselAutoplay}
          onBlur={stopCarouselAutoplay}
        >
          {[0, 1, 2].flatMap((cycleIndex) =>
            PORTRAITS.map((portrait, index) => {
              const isCanonicalCycle = cycleIndex === 1;

              return (
                <div
                  className={styles.mobilePortraitSlot}
                  data-carousel-cycle-start={index === 0 ? "" : undefined}
                  role={isCanonicalCycle ? "listitem" : undefined}
                  aria-hidden={isCanonicalCycle ? undefined : true}
                  aria-posinset={isCanonicalCycle ? index + 1 : undefined}
                  aria-setsize={isCanonicalCycle ? PORTRAITS.length : undefined}
                  key={`carousel-${cycleIndex}-${portrait.id}`}
                >
                  <figure className={styles.mobilePortrait}>
                    <PortraitCrop atlasIndex={portrait.atlasIndex} />
                    <figcaption>{portrait.label}</figcaption>
                  </figure>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function WellbeingHero({ reduceMotion }: { reduceMotion: boolean }) {
  const hero = seasonOffer2026Content.hero;

  return (
    <section className={styles.wellbeingHero} aria-labelledby="wellbeing-hero-title">
      <motion.div
        className={styles.wellbeingBackdrop}
        initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.15, ease: EASE }}
        aria-hidden="true"
      >
        <Image
          src="/experiments/seasonal-offer-hero/wellbeing-landscape.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.wellbeingLandscape}
        />
        <Image
          src="/experiments/seasonal-offer-hero/wellbeing-portrait-v2.png"
          alt=""
          fill
          priority
          sizes="(max-width: 720px) 100vw, 1px"
          className={styles.wellbeingPortrait}
        />
      </motion.div>

      <div className={styles.wellbeingCopy}>
        <h1 id="wellbeing-hero-title" className={styles.wellbeingHeadline}>
          {[
            { text: "Финансовое", accent: "" },
            { text: "благополучие", accent: styles.wellbeingAccentSupport },
            { text: "сотрудников —", accent: "" },
            { text: "без роста ФОТ", accent: styles.wellbeingAccentValue },
          ].map((line, index) => (
            <span className={styles.lineClip} key={line.text}>
              <motion.span
                className={line.accent}
                initial={reduceMotion ? false : { y: "112%", filter: "blur(7px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.72, delay: 0.12 + index * 0.075, ease: EASE }}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className={styles.wellbeingDetails}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.38, ease: EASE }}
        >
          <p>{hero.lead}</p>
        </motion.div>
      </div>

      <div className={styles.wellbeingBottomRail}>
        <motion.div
          className={styles.wellbeingActionDock}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.42, ease: EASE }}
        >
          <HeroAction className={styles.wellbeingCta} reduceMotion={reduceMotion} />
        </motion.div>

        <motion.dl
          className={styles.wellbeingStats}
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.68, delay: 0.46, ease: EASE }}
        >
          {hero.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.44, delay: 0.56 + index * 0.06, ease: EASE }}
            >
              <dd>{metric.value}</dd>
              <dt>{metric.label}</dt>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

function TypographicHero({ reduceMotion }: { reduceMotion: boolean }) {
  const hero = seasonOffer2026Content.hero;

  return (
    <section className={styles.typeHero} aria-labelledby="type-hero-title">
      <motion.div
        className={styles.typeObject}
        initial={reduceMotion ? false : { opacity: 0, scale: 1.1, x: 72 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.82, ease: EASE }}
        aria-hidden="true"
      >
        <Image
          src="/heroV2.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 68vw, 100vw"
          className={styles.typeImage}
        />
      </motion.div>

      <div className={styles.typeGrid}>
        <h1 id="type-hero-title" className={styles.typeHeadline}>
          {[
            { text: "Финансовое ", accent: "благополучие" },
            { text: "сотрудников —", accent: "" },
            { text: "", accent: "без роста ФОТ" },
          ].map((line, index) => (
            <span
              className={`${styles.lineClip} ${styles.fixedHeadlineLine}`}
              key={`${line.text}${line.accent}`}
            >
              <motion.span
                initial={reduceMotion ? false : { y: "112%", filter: "blur(8px)" }}
                animate={{ y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: index * 0.065, ease: EASE }}
              >
                {line.text}
                {line.accent ? (
                  <span className={styles.typeHeadlineAccent}>{line.accent}</span>
                ) : null}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className={styles.typeDetails}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.26, ease: EASE }}
        >
          <p>{hero.lead}</p>
        </motion.div>
      </div>

      <div className={styles.typeBottomRail}>
        <motion.div
          className={styles.typeActionDock}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.34, ease: EASE }}
        >
          <HeroAction className={styles.typeCta} reduceMotion={reduceMotion} />
        </motion.div>

        <motion.dl
          className={styles.typeMetrics}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, delay: 0.38, ease: EASE }}
        >
          {hero.metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.44 + index * 0.06, ease: EASE }}
            >
              <dd>{metric.value}</dd>
              <dt>{metric.label}</dt>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}

function HybridHero({
  reduceMotion,
  initialThemeId,
}: {
  reduceMotion: boolean;
  initialThemeId: HybridThemeId;
}) {
  const hero = seasonOffer2026Content.hero;
  const [activeThemeId, setActiveThemeId] = useState<HybridThemeId>(initialThemeId);
  const [pendingThemeId, setPendingThemeId] = useState<HybridThemeId | null>(null);
  const themeLoadRequest = useRef(0);
  const activeTheme =
    HYBRID_THEMES.find((theme) => theme.id === activeThemeId) ?? HYBRID_THEMES[0];

  const handleThemeChange = (theme: (typeof HYBRID_THEMES)[number]) => {
    if (theme.id === activeThemeId && pendingThemeId === null) return;

    const requestId = themeLoadRequest.current + 1;
    themeLoadRequest.current = requestId;
    setPendingThemeId(theme.id);

    const usePortrait = window.matchMedia(
      "(max-width: 720px), (max-width: 1023px) and (orientation: portrait)",
    ).matches;
    const preload = new window.Image();

    preload.onload = () => {
      if (themeLoadRequest.current !== requestId) return;
      setActiveThemeId(theme.id);
      setPendingThemeId(null);
    };
    preload.onerror = () => {
      if (themeLoadRequest.current !== requestId) return;
      setPendingThemeId(null);
    };
    preload.src = usePortrait ? theme.portrait : theme.landscape;
  };

  return (
    <section
      className={styles.hybridHero}
      data-photo-theme={activeTheme.id}
      aria-labelledby="hybrid-hero-title"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={activeTheme.id}
          className={styles.hybridBackdrop}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012 }}
          transition={{ duration: reduceMotion ? 0 : 0.36, ease: EASE }}
          aria-hidden="true"
        >
          <Image
            src={activeTheme.landscape}
            alt=""
            fill
            priority={activeTheme.id === initialThemeId}
            unoptimized
            sizes="100vw"
            className={styles.hybridLandscape}
          />
          <Image
            src={activeTheme.portrait}
            alt=""
            fill
            priority={activeTheme.id === initialThemeId}
            unoptimized
            sizes="(max-width: 720px) 100vw, (max-width: 1023px) and (orientation: portrait) 100vw, 1px"
            className={styles.hybridPortrait}
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className={styles.hybridThemePicker}
        role="group"
        aria-label="Цветовая версия фотографии"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.42, delay: 0.22, ease: EASE }}
      >
        {HYBRID_THEMES.map((theme) => {
          const selected = theme.id === activeTheme.id;
          const loading = theme.id === pendingThemeId;

          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={selected}
              aria-busy={loading}
              aria-label={`Показать фото: ${theme.label}`}
              title={theme.label}
              className={styles.hybridThemeButton}
              onClick={() => handleThemeChange(theme)}
            >
              <span
                className={`${styles.hybridThemeSwatch} ${theme.swatchClassName}`}
                aria-hidden="true"
              />
              <span className={styles.hybridThemeName}>{theme.shortLabel}</span>
            </button>
          );
        })}
      </motion.div>

      <div className={styles.hybridContent}>
        <motion.div
          className={styles.hybridHeadlinePanel}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  clipPath: "inset(0 100% 0 0 round 24px)",
                }
          }
          animate={{ opacity: 1, clipPath: "inset(0 0% 0 0 round 24px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.82, ease: EASE }}
        >
          <h1 id="hybrid-hero-title" className={styles.hybridHeadline}>
            {[
              {
                text: "Финансовое ",
                accent: "благополучие",
                className: styles.hybridAccentGrowth,
              },
              { text: "сотрудников —", accent: "", className: "" },
              { text: "", accent: "без роста ФОТ", className: styles.hybridAccentValue },
            ].map((line, index) => (
              <span className={styles.lineClip} key={`${line.text}${line.accent}`}>
                <motion.span
                  initial={reduceMotion ? false : { y: "112%", filter: "blur(7px)" }}
                  animate={{ y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.72, delay: 0.12 + index * 0.075, ease: EASE }}
                >
                  {line.text}
                  {line.accent ? (
                    <span className={line.className}>{line.accent}</span>
                  ) : null}
                </motion.span>
              </span>
            ))}
          </h1>
        </motion.div>

        <div className={styles.hybridSceneWindow} aria-hidden="true" />

        <motion.div
          className={styles.hybridDetailsPanel}
          initial={reduceMotion ? false : { opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.28, ease: EASE }}
        >
          <p className={styles.hybridLead}>{hero.lead}</p>

          <div className={styles.hybridActions}>
            <HeroAction className={styles.hybridCta} reduceMotion={reduceMotion} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SeasonalOfferHeroLab({
  initialVariant = "people",
  initialHybridTheme = "cool",
}: {
  initialVariant?: VariantId;
  initialHybridTheme?: HybridThemeId;
}) {
  const [activeVariant, setActiveVariant] = useState<VariantId>(initialVariant);
  const reduceMotion = Boolean(useReducedMotion());
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = useMemo(
    () => VARIANTS.findIndex((variant) => variant.id === activeVariant),
    [activeVariant]
  );

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = activeIndex;

    if (event.key === "ArrowRight") nextIndex = (activeIndex + 1) % VARIANTS.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeIndex - 1 + VARIANTS.length) % VARIANTS.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = VARIANTS.length - 1;
    if (nextIndex === activeIndex) return;

    event.preventDefault();
    const nextVariant = VARIANTS[nextIndex];
    setActiveVariant(nextVariant.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={styles.lab}
        data-design-contract="seasonal-offer-hero-five-up-v5"
        data-thesis="five truthful proofs: people, material support, typographic clarity, multi-palette synthesis, people in financial focus"
      >
        <header className={styles.labToolbar}>
          <div className={styles.toolbarInner}>
            <Link href="/experiments" className={styles.backLink}>
              <ArrowLeft aria-hidden="true" />
              <span>Эксперименты</span>
            </Link>

            <div className={styles.labTitle}>
              <strong>Hero сезонного офера</strong>
              <span>5 направлений</span>
            </div>

            <div className={styles.variantTabs} role="tablist" aria-label="Варианты hero">
              {VARIANTS.map((variant, index) => {
                const selected = activeVariant === variant.id;

                return (
                  <button
                    key={variant.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    id={`variant-tab-${variant.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`variant-panel-${variant.id}`}
                    tabIndex={selected ? 0 : -1}
                    data-testid={`variant-${variant.id}`}
                    className={styles.variantTab}
                    onClick={() => setActiveVariant(variant.id)}
                    onKeyDown={handleTabKeyDown}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div className={styles.stage}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeVariant}
              id={`variant-panel-${activeVariant}`}
              role="tabpanel"
              aria-labelledby={`variant-tab-${activeVariant}`}
              className={styles.variantPanel}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, x: 32, clipPath: "inset(0 0 0 8%)" }
              }
              animate={{ opacity: 1, x: 0, clipPath: "inset(0 0 0 0%)" }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -24, clipPath: "inset(0 8% 0 0)" }
              }
              transition={{ duration: reduceMotion ? 0 : 0.48, ease: EASE }}
            >
              {activeVariant === "people" ? (
                <PeopleHero reduceMotion={reduceMotion} />
              ) : null}
              {activeVariant === "wellbeing" ? (
                <WellbeingHero reduceMotion={reduceMotion} />
              ) : null}
              {activeVariant === "typographic" ? (
                <TypographicHero reduceMotion={reduceMotion} />
              ) : null}
              {activeVariant === "hybrid" ? (
                <HybridHero
                  reduceMotion={reduceMotion}
                  initialThemeId={initialHybridTheme}
                />
              ) : null}
              {activeVariant === "focus" ? (
                <PeopleHero reduceMotion={reduceMotion} mode="focus" />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </MotionConfig>
  );
}
