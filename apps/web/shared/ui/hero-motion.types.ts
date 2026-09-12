import type { MotionStyle, MotionValue } from "motion/react";
import type { ReactNode } from "react";

export interface HeroMotionSceneProps {
  hero: ReactNode;
  children: ReactNode;
  missionDeck?: boolean;
  sentinel?: boolean;
  variant?: "illustration" | "photo" | "editorial";
  surfaceClassName?: string;
}

export type HeroMotionStyle = MotionStyle & {
  [key: `--home-${string}`]: MotionValue<number> | MotionValue<string> | number | string;
};
