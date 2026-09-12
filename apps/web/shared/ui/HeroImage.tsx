"use client";

import Image from "next/image";
import { animate } from "motion/react";
import { useCallback, useLayoutEffect, useRef } from "react";

import { cn } from "@/shared/lib/cn";
import { motionTokens, useReducedMotion } from "@/shared/lib/motion";

interface HeroImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}

export function HeroImage({ src, alt, className, ...props }: HeroImageProps) {
  const playback = useRef<ReturnType<typeof animate> | null>(null);
  const reduced = useReducedMotion();

  const prepareImage = useCallback((image: HTMLImageElement | null) => {
    if (!image) return;
    // SSR stays visible. Only prepare a fade if the image is still loading
    // when hydration attaches the ref; cached images must never flash out.
    if (!image.complete) image.setAttribute("data-hero-image-pending", "");

    return () => {
      playback.current?.stop();
      image.removeAttribute("data-hero-image-pending");
    };
  }, []);

  useLayoutEffect(() => {
    if (reduced) playback.current?.complete();
  }, [reduced]);

  function revealImage(image: HTMLImageElement) {
    if (!image.hasAttribute("data-hero-image-pending")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      image.removeAttribute("data-hero-image-pending");
      return;
    }

    // Next/Image calls onLoad after decoding. Keep the pending style until
    // playback finishes so its first animation frame cannot flash opaque.
    const animation = animate(image, { opacity: [0, 1] }, {
      duration: motionTokens.content,
      ease: motionTokens.ease,
    });
    playback.current = animation;
    void animation.then(() => image.removeAttribute("data-hero-image-pending"));
  }

  return (
    <Image
      key={src}
      ref={prepareImage}
      src={src}
      alt={alt}
      {...props}
      fill
      preload
      onLoad={(event) => revealImage(event.currentTarget)}
      onError={(event) => event.currentTarget.removeAttribute("data-hero-image-pending")}
      className={cn("data-[hero-image-pending]:opacity-0 motion-reduce:!opacity-100", className)}
    />
  );
}
