import Image from "next/image";

import { PORTRAIT_POOLS, portraitSource } from "../model/portraits";
import styles from "./season-offer-hero.module.css";

export function SeasonOfferPortraitImage({
  id,
  tall,
  priority = false,
  lazy = false,
}: {
  id: string;
  tall: boolean;
  priority?: boolean;
  lazy?: boolean;
}) {
  const original = PORTRAIT_POOLS.some((pool) => pool[0] === id);

  return (
    <Image
      src={portraitSource(id)}
      alt=""
      width={800}
      height={tall ? 1600 : 800}
      sizes="(min-width: 1600px) 334px, (min-width: 1200px) 24vw, 170px"
      priority={priority}
      loading={priority ? undefined : lazy ? "lazy" : "eager"}
      // Prepared WebPs share a URL for decoding and rendering, including in production.
      unoptimized
      className={`${styles.image} ${original ? styles.originalCrop : ""}`}
    />
  );
}
