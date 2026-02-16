import { TeamContainer } from "./TeamContainer";
import type { TeamProps } from "./types";

export function Team(props: TeamProps) {
  return <TeamContainer {...props} />;
}

