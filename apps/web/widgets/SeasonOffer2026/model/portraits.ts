const ROOT = "/services/season-offer/portraits";

export const PORTRAIT_POOLS = [
  ["portrait-specialist", "portrait-tall-man", "portrait-tall-woman"],
  ["portrait-engineer", "portrait-square-woman-young", "portrait-square-man"],
  ["portrait-colleague", "portrait-square-woman-midlife", "portrait-square-woman-junior"],
] as const;

export const PORTRAIT_FADE_DURATION_MS = 500;
export const PORTRAIT_INTERVAL = 5000 - PORTRAIT_FADE_DURATION_MS;
const SLOT_ORDER = [1, 2, 0] as const;

// Illustrative employee personas, using the same professions as People/Focus.
export const PORTRAIT_LABELS: Record<string, string> = {
  "portrait-specialist": "HR-менеджер",
  "portrait-engineer": "Инженер",
  "portrait-colleague": "Аналитик",
  "portrait-tall-man": "Бухгалтер",
  "portrait-tall-woman": "Руководитель",
  "portrait-square-woman-young": "L&D-менеджер",
  "portrait-square-man": "Консультант",
  "portrait-square-woman-midlife": "Маркетолог",
  "portrait-square-woman-junior": "Продавец",
};

export const CAROUSEL_PORTRAITS = [0, 1, 2].flatMap((index) =>
  PORTRAIT_POOLS.map((pool, slot) => ({ id: pool[index], tall: slot === 0 }))
);

export function carouselPosition(position: number, previousWidth: number, nextWidth: number) {
  if (nextWidth <= 0) return 0;
  if (previousWidth <= 0) return nextWidth;
  const phase = ((position % previousWidth) + previousWidth) % previousWidth;
  return nextWidth + (phase / previousWidth) * nextWidth;
}

export const portraitSource = (id: string) => `${ROOT}/${id}.webp`;

export interface PortraitSwap {
  slot: number;
  index: number;
  id: string;
  turn: number;
}

export interface PortraitState {
  indices: readonly number[];
  turn: number;
  ready: string | null;
  incoming: PortraitSwap | null;
  unavailable: readonly string[];
}

export const initialPortraitState: PortraitState = {
  indices: [0, 0, 0],
  turn: 0,
  ready: null,
  incoming: null,
  unavailable: [],
};

export function nextPortrait(state: PortraitState): PortraitSwap | null {
  // A failed image never displaces the visible frame or stalls other slots.
  for (let offset = 0; offset < SLOT_ORDER.length; offset++) {
    const turn = state.turn + offset;
    const slot = SLOT_ORDER[turn % SLOT_ORDER.length];
    const pool = PORTRAIT_POOLS[slot];
    for (let distance = 1; distance < pool.length; distance++) {
      const index = (state.indices[slot] + distance) % pool.length;
      const id = pool[index];
      if (!state.unavailable.includes(id)) return { slot, index, id, turn };
    }
  }
  return null;
}

export type PortraitAction =
  | { type: "loaded"; id: string }
  | { type: "failed"; id: string }
  | { type: "advance" }
  | { type: "complete"; id: string };

export function portraitReducer(state: PortraitState, action: PortraitAction): PortraitState {
  if (action.type === "complete") {
    if (state.incoming?.id !== action.id) return state;
    const indices = [...state.indices];
    indices[state.incoming.slot] = state.incoming.index;
    return { ...state, indices, turn: state.incoming.turn + 1, ready: null, incoming: null };
  }

  if (state.incoming) return state;
  const next = nextPortrait(state);
  if (!next) return state;

  switch (action.type) {
    case "loaded":
      return action.id === next.id ? { ...state, ready: action.id } : state;
    case "failed":
      return action.id === next.id
        ? { ...state, ready: null, unavailable: [...state.unavailable, action.id] }
        : state;
    case "advance":
      return state.ready === next.id ? { ...state, incoming: next } : state;
  }
}
