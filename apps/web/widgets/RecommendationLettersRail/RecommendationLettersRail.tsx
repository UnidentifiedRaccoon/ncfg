"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import type { CertificateData } from "@/shared/api/certificates";
import { cn } from "@/shared/lib/cn";
import type { RecommendationLettersRailProps } from "./types";

interface RailVariantStyle {
  shell: string;
  control: string;
  controlDisabled: string;
  trackInset: string;
  itemWidth: string;
  card: string;
  cardBeam: string;
  previewShell: string;
  previewSurface: string;
  previewMask: string;
  previewAspect: string;
  badge: string;
  title: string;
}

const GLASS_LEDGER_STYLE: RailVariantStyle = {
  shell: "relative",
  control:
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[#153153] shadow-[0_8px_24px_rgba(15,23,42,0.10)] backdrop-blur transition-colors duration-200 hover:border-[#93C5FD] hover:text-[#2563EB]",
  controlDisabled:
    "border-white/60 bg-white/70 text-[#9CB0C6] hover:border-white/60 hover:text-[#9CB0C6]",
  trackInset: "px-0",
  itemWidth: "basis-[86%] sm:basis-[350px] lg:basis-[372px]",
  card:
    "border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))] shadow-[0_22px_60px_rgba(15,23,42,0.10)] hover:-translate-y-1.5 hover:shadow-[0_28px_72px_rgba(59,130,246,0.16)]",
  cardBeam:
    "via-[#58A8E0]/80",
  previewShell:
    "rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.60))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm",
  previewSurface:
    "rounded-[20px] border border-white/80 bg-[radial-gradient(circle_at_18%_14%,rgba(88,168,224,0.20),transparent_42%),linear-gradient(180deg,#FCFEFF_0%,#E8F1FC_100%)] shadow-[0_12px_32px_rgba(30,58,95,0.10)]",
  previewMask:
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0)_34%,rgba(30,58,95,0.10)_100%)]",
  previewAspect: "aspect-[4/5]",
  badge:
    "border border-white/70 bg-[#1E3A5F]/82 text-white shadow-[0_8px_22px_rgba(30,58,95,0.20)] backdrop-blur-sm",
  title:
    "text-[23px] leading-[1.16] tracking-tight text-[#153153] md:text-[25px]",
};

function RailControlButton({
  direction,
  disabled,
  onClick,
  style,
  controls,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  style: RailVariantStyle;
  controls: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label =
    direction === "prev"
      ? "Прокрутить галерею влево"
      : "Прокрутить галерею вправо";

  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className={cn(style.control, disabled && style.controlDisabled)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function LetterPreview({
  letter,
  style,
}: {
  letter: CertificateData;
  style: RailVariantStyle;
}) {
  const hasImagePreview = Boolean(letter.previewImageUrl);

  return (
    <div className={style.previewShell}>
      <div
        className={cn(
          "relative overflow-hidden",
          style.previewAspect,
          style.previewSurface
        )}
      >
        {hasImagePreview ? (
          <Image
            src={letter.previewImageUrl ?? letter.fileUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 380px, 420px"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-full border border-white/80 bg-white/75 p-4 text-[#1E3A5F] shadow-[0_16px_40px_rgba(30,58,95,0.10)] backdrop-blur-sm">
              <FileText className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-[26px] font-semibold tracking-[0.08em] text-[#153153]">
                {letter.fileType}
              </p>
              <p className="text-sm text-[#59708A]">
                Открыть оригинал документа
              </p>
            </div>
          </div>
        )}
        <div aria-hidden="true" className={cn("absolute inset-0", style.previewMask)} />

        <div className="absolute inset-x-0 top-0 flex items-center justify-start p-3">
          <div className="flex w-full items-start justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                style.badge
              )}
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              {letter.fileType}
            </span>

            {letter.year ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                  style.badge
                )}
              >
                {letter.year}
              </span>
            ) : null}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <span
            className={cn(
              "inline-flex max-w-full items-center truncate rounded-full px-3 py-1 text-[11px] font-semibold",
              style.badge
            )}
            title={letter.company}
          >
            <span className="truncate">{letter.company}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function DefaultCardContent({
  letter,
  style,
}: {
  letter: CertificateData;
  style: RailVariantStyle;
}) {
  return (
    <div className="mt-4 flex flex-1 flex-col">
      <h3 className={cn("line-clamp-3 font-semibold", style.title)}>
        {letter.title}
      </h3>
    </div>
  );
}

function RecommendationLetterCard({
  letter,
}: {
  letter: CertificateData;
}) {
  const style = GLASS_LEDGER_STYLE;

  return (
    <article
      className={cn(
        "snap-start shrink-0",
        style.itemWidth
      )}
    >
      <a
        href={letter.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Открыть документ «${letter.title}» в новой вкладке`}
        className={cn(
          "group relative block h-full overflow-hidden rounded-[28px] transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B82F6]",
          style.card
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            style.cardBeam
          )}
        />

        <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
          <LetterPreview letter={letter} style={style} />
          <DefaultCardContent letter={letter} style={style} />
        </div>
      </a>
    </article>
  );
}

export function RecommendationLettersRail({
  items,
  className,
}: RecommendationLettersRailProps) {
  const railId = useId();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > 1);
  const style = GLASS_LEDGER_STYLE;

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const syncControls = (): void => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      setCanScrollPrev(track.scrollLeft > 4);
      setCanScrollNext(maxScrollLeft - track.scrollLeft > 4);
    };

    syncControls();
    track.addEventListener("scroll", syncControls, { passive: true });
    window.addEventListener("resize", syncControls);

    return () => {
      track.removeEventListener("scroll", syncControls);
      window.removeEventListener("resize", syncControls);
    };
  }, [items.length]);

  function scrollTrack(direction: "prev" | "next"): void {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const distance = Math.min(track.clientWidth * 0.9, 420);
    track.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-[#475569]">
        Документы не найдены.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("relative", style.shell)}>
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">
                Подборка документов
              </div>
              <p className="mt-1 text-sm text-[#59708A]">
                {items.length} документов в архиве
              </p>
            </div>
          </div>

          <div className="relative">
            <div
              id={railId}
              ref={trackRef}
              className={cn(
                "flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:gap-5",
                style.trackInset
              )}
            >
              {items.map((letter) => (
                <RecommendationLetterCard
                  key={letter.id}
                  letter={letter}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 md:mt-6">
            <RailControlButton
              direction="prev"
              disabled={!canScrollPrev}
              onClick={() => scrollTrack("prev")}
              style={style}
              controls={railId}
            />
            <RailControlButton
              direction="next"
              disabled={!canScrollNext}
              onClick={() => scrollTrack("next")}
              style={style}
              controls={railId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
