import { Onest, PT_Serif } from "next/font/google";

import { Button } from "@/shared/ui/Button";

import { SeasonOfferPortraits } from "./SeasonOfferPortraits";
import { SeasonOfferPeopleCarousel } from "./SeasonOfferPeopleCarousel";
import styles from "./season-offer-hero.module.css";
import type { SeasonOfferHeroContent } from "../model/types";

const onest = Onest({
  variable: "--font-season-offer-sans",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const ptSerif = PT_Serif({
  variable: "--font-season-offer-serif",
  weight: "400",
  style: "italic",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

// Approved editorial hero: server-rendered copy, client-side portrait motion.
export function SeasonOfferHero({ headline, lead, primaryAction }: SeasonOfferHeroContent) {
  return (
    <section
      className={`${onest.variable} ${ptSerif.variable} ${styles.hero}`}
      aria-labelledby="season-offer-heading"
      data-design-contract="season-offer-human-accent"
    >
      <div className={styles.layout}>
        <div className={styles.copy} data-hero-copy>
          <h1 id="season-offer-heading" className={styles.headline}>
            <span>
              {`${headline.topic} `}
              <em className={styles.emphasis}>{headline.benefit}</em>
            </span>{" "}
            <em className={styles.emphasis}>{headline.budget}</em>
          </h1>

          <p className={styles.lead}>{lead}</p>

          <Button
            href={primaryAction.href}
            size="lg"
            className={styles.action}
            data-ym-goal="cta_click"
            data-ym-cta-location="hero"
          >
            {primaryAction.label}
          </Button>
        </div>

        <SeasonOfferPortraits />
        <SeasonOfferPeopleCarousel />
      </div>
    </section>
  );
}
