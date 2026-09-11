export type PlanId = "launch" | "pilot" | "wait";
export type ResponseId = "continue" | "reduce" | "pause";
export type SessionPhase = 0 | 1 | 2 | 3 | 4;

export interface Player {
  id: "anna" | "mikhail";
  number: 1 | 2;
  name: string;
  priority: string;
  motivation: string;
  firstProposal: string;
  revisedProposal: string;
}
