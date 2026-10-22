import { HeroMotionScene } from "@/shared/ui/HeroMotionScene";
import type { HomeMotionSceneProps } from "./types";

export function HomeMotionScene({ hero, mission }: HomeMotionSceneProps) {
  return <HeroMotionScene hero={hero} missionDeck>{mission}</HeroMotionScene>;
}
