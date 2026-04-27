"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/shared/lib/cn";

interface HeroImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  blurDataURL: string;
}

export function HeroImage({
  src,
  alt,
  sizes,
  className,
  blurDataURL,
}: HeroImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete || image.naturalWidth === 0) {
      return;
    }

    let isActive = true;

    queueMicrotask(() => {
      if (isActive) {
        setLoadedSrc(src);
      }
    });

    return () => {
      isActive = false;
    };
  }, [src]);

  return (
    <>
      <Image
        src={blurDataURL}
        alt=""
        aria-hidden="true"
        fill
        unoptimized
        sizes={sizes}
        className={cn(
          className,
          "blur-sm transition-opacity duration-500 ease-out motion-reduce:transition-none",
          loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        fill
        preload
        sizes={sizes}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setLoadedSrc(src)}
        className={cn(
          className,
          "opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
          loaded && "opacity-100"
        )}
      />
    </>
  );
}
