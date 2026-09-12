"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useInView } from "motion/react";

import { useDesktopScene, useDocumentVisible, useReducedMotion } from "@/shared/lib/motion";

import { CAROUSEL_PORTRAITS, carouselPosition, PORTRAIT_LABELS } from "../model/portraits";
import { SeasonOfferPortraitImage } from "./SeasonOfferPortraitImage";
import styles from "./season-offer-hero.module.css";

const TRACK_ID = "season-offer-employee-carousel";

export function SeasonOfferPeopleCarousel() {
  const region = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cycleWidth = useRef(0);
  const position = useRef(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const desktop = useDesktopScene();
  const visible = useDocumentVisible();
  const reduceMotion = useReducedMotion();
  const inView = useInView(region, { amount: 0.4 });
  const playing = !desktop && visible && inView && !paused && !hovered && !reduceMotion;

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const starts = element.querySelectorAll<HTMLElement>("[data-employee-cycle-start]");
      if (starts.length < 2 || !element.clientWidth) return;
      const width = starts[1].offsetLeft - starts[0].offsetLeft;
      if (width <= 0) return;
      position.current = carouselPosition(element.scrollLeft, cycleWidth.current, width);
      cycleWidth.current = width;
      element.scrollLeft = position.current;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element || !playing) return;
    let frame: number;
    let previous = performance.now();
    position.current = element.scrollLeft;
    const tick = (time: number) => {
      const delta = Math.min(time - previous, 64);
      previous = time;
      if (cycleWidth.current > 0) {
        // Retain fractional progress even when the browser rounds scrollLeft.
        position.current = carouselPosition(position.current + delta * 0.02, cycleWidth.current, cycleWidth.current);
        element.scrollLeft = position.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const move = (direction: number) => {
    setPaused(true);
    const element = track.current;
    if (!element || !cycleWidth.current) return;
    element.scrollLeft = carouselPosition(element.scrollLeft, cycleWidth.current, cycleWidth.current);
    element.scrollBy({
      left: direction * (cycleWidth.current / CAROUSEL_PORTRAITS.length),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setPaused(true);
      const element = track.current;
      if (!element) return;
      element.scrollTo({
        left: cycleWidth.current + (event.key === "End" ? cycleWidth.current - element.clientWidth : 0),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <div
      ref={region}
      className={styles.carousel}
      role="region"
      aria-roledescription="карусель"
      aria-label="Сотрудники разных профессий"
      aria-describedby={`${TRACK_ID}-hint`}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      data-season-offer-carousel
    >
      <p id={`${TRACK_ID}-hint`} className={styles.srOnly}>
        Листайте фотографии сотрудников свайпом или клавишами со стрелками. Ручное управление останавливает автопрокрутку.
      </p>
      <div
        ref={track}
        id={TRACK_ID}
        className={styles.carouselTrack}
        role="list"
        aria-label="Профессии сотрудников"
        aria-live="off"
        tabIndex={0}
        onPointerDown={() => setPaused(true)}
        onWheel={() => setPaused(true)}
        onFocus={() => setPaused(true)}
        onKeyDown={onKeyDown}
      >
        {[0, 1, 2].flatMap((cycle) => CAROUSEL_PORTRAITS.map(({ id, tall }, index) => (
          <div
            key={`${cycle}-${id}`}
            className={styles.carouselItem}
            data-employee-cycle-start={index === 0 ? "" : undefined}
            role={cycle === 1 ? "listitem" : undefined}
            aria-hidden={cycle === 1 ? undefined : true}
            aria-posinset={cycle === 1 ? index + 1 : undefined}
            aria-setsize={cycle === 1 ? CAROUSEL_PORTRAITS.length : undefined}
          >
            <figure>
              <div className={styles.carouselPhoto}>
                <SeasonOfferPortraitImage id={id} tall={tall} lazy />
              </div>
              <figcaption>{PORTRAIT_LABELS[id]}</figcaption>
            </figure>
          </div>
        )))}
      </div>
    </div>
  );
}
