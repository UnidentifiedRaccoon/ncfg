export type DiagnosticTone = "red" | "yellow" | "green";

export interface DiagnosticEmailToneStyle {
  scoreCircleBorderColor: string;
  scoreCircleBackgroundColor: string;
  scoreNumberColor: string;
  insightBorderColor: string;
  insightBoxShadow: string;
  insightBadgeBackgroundColor: string;
  insightBadgeColor: string;
  insightBackgroundColor: string;
}

export function getDiagnosticScoreTone(percent: number): DiagnosticTone {
  if (percent <= 40) return "red";
  if (percent <= 70) return "yellow";
  return "green";
}

export function getDiagnosticInsightTone(weight: number): DiagnosticTone {
  if (weight <= 3) return "red";
  if (weight <= 6) return "yellow";
  return "green";
}

export const diagnosticScoreCircleClassByTone = {
  red: "border-[#E2969C]/60 bg-[#FDF0F1]/60",
  yellow: "border-[#D4B678]/60 bg-[#FBF4E8]/60",
  green: "border-[#7DB8A4]/60 bg-[#EDF6F2]/60",
} satisfies Record<DiagnosticTone, string>;

export const diagnosticScoreNumberClassByTone = {
  red: "text-[#C2555E]",
  yellow: "text-[#9A7530]",
  green: "text-[#3D7D65]",
} satisfies Record<DiagnosticTone, string>;

export const diagnosticInsightBorderClassByTone = {
  red: {
    closed: "border-[#E2969C]/40",
    open: "border-[#C9686F]/40 shadow-[0_4px_16px_rgba(194,85,94,0.10)]",
  },
  yellow: {
    closed: "border-[#D4B678]/40",
    open: "border-[#BF9A4E]/40 shadow-[0_4px_16px_rgba(191,154,78,0.10)]",
  },
  green: {
    closed: "border-[#7DB8A4]/40",
    open: "border-[#549479]/40 shadow-[0_4px_16px_rgba(84,148,121,0.10)]",
  },
} satisfies Record<DiagnosticTone, { closed: string; open: string }>;

export const diagnosticInsightBadgeClassByTone = {
  red: {
    closed: "bg-[#FDF0F1] text-[#A84850]",
    open: "bg-[#C2555E] text-white",
  },
  yellow: {
    closed: "bg-[#FBF4E8] text-[#856428]",
    open: "bg-[#9A7530] text-white",
  },
  green: {
    closed: "bg-[#EDF6F2] text-[#2F6B52]",
    open: "bg-[#3D7D65] text-white",
  },
} satisfies Record<DiagnosticTone, { closed: string; open: string }>;

export const diagnosticInsightBackgroundClassByTone = {
  red: "bg-[#FCECED]/50",
  yellow: "bg-[#FAF2E5]/50",
  green: "bg-[#ECF5F0]/50",
} satisfies Record<DiagnosticTone, string>;

export const diagnosticEmailToneStyleByTone = {
  red: {
    scoreCircleBorderColor: "rgba(226, 150, 156, 0.6)",
    scoreCircleBackgroundColor: "rgba(253, 240, 241, 0.6)",
    scoreNumberColor: "#C2555E",
    insightBorderColor: "rgba(201, 104, 111, 0.4)",
    insightBoxShadow: "0 4px 16px rgba(194, 85, 94, 0.10)",
    insightBadgeBackgroundColor: "#C2555E",
    insightBadgeColor: "#FFFFFF",
    insightBackgroundColor: "rgba(252, 236, 237, 0.5)",
  },
  yellow: {
    scoreCircleBorderColor: "rgba(212, 182, 120, 0.6)",
    scoreCircleBackgroundColor: "rgba(251, 244, 232, 0.6)",
    scoreNumberColor: "#9A7530",
    insightBorderColor: "rgba(191, 154, 78, 0.4)",
    insightBoxShadow: "0 4px 16px rgba(191, 154, 78, 0.10)",
    insightBadgeBackgroundColor: "#9A7530",
    insightBadgeColor: "#FFFFFF",
    insightBackgroundColor: "rgba(250, 242, 229, 0.5)",
  },
  green: {
    scoreCircleBorderColor: "rgba(125, 184, 164, 0.6)",
    scoreCircleBackgroundColor: "rgba(237, 246, 242, 0.6)",
    scoreNumberColor: "#3D7D65",
    insightBorderColor: "rgba(84, 148, 121, 0.4)",
    insightBoxShadow: "0 4px 16px rgba(84, 148, 121, 0.10)",
    insightBadgeBackgroundColor: "#3D7D65",
    insightBadgeColor: "#FFFFFF",
    insightBackgroundColor: "rgba(236, 245, 240, 0.5)",
  },
} satisfies Record<DiagnosticTone, DiagnosticEmailToneStyle>;
