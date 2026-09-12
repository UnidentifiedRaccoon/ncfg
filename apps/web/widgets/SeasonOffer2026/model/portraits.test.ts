import assert from "node:assert/strict";
import { test } from "node:test";

import {
  initialPortraitState,
  carouselPosition,
  nextPortrait,
  PORTRAIT_POOLS,
  portraitReducer,
  type PortraitState,
} from "./portraits";

test("carousel wraps in both directions without changing the visible employee", () => {
  assert.equal(carouselPosition(2020, 1000, 1000), 1020);
  assert.equal(carouselPosition(980, 1000, 1000), 1980);
  assert.equal(carouselPosition(-20, 1000, 1000), 1980);
  assert.equal(carouselPosition(1000.25, 1000, 1000), 1000.25);
});

test("carousel preserves its employee and fractional offset when tablet card sizes change", () => {
  assert.equal(carouselPosition(1250, 1000, 1600), 2000);
  assert.equal(carouselPosition(0, 0, 1600), 1600);
  assert.equal(carouselPosition(1250, 1000, 0), 0);
});

function advanceLoaded(state: PortraitState) {
  const next = nextPortrait(state)!;
  state = portraitReducer(state, { type: "loaded", id: next.id });
  state = portraitReducer(state, { type: "advance" });
  return portraitReducer(state, { type: "complete", id: next.id });
}

test("nine portraits cycle through fixed slots, changing only one at a time", () => {
  let state = initialPortraitState;
  const seen = new Set<string>(PORTRAIT_POOLS.map((pool) => pool[0]));
  const slots: number[] = [];
  for (let turn = 0; turn < 9; turn++) {
    const next = nextPortrait(state)!;
    slots.push(next.slot);
    seen.add(next.id);
    const previous = state;
    state = advanceLoaded(state);
    assert.equal(state.indices.filter((value, slot) => value !== previous.indices[slot]).length, 1);
  }
  assert.deepEqual(slots, [1, 2, 0, 1, 2, 0, 1, 2, 0]);
  assert.equal(seen.size, 9);
  assert.deepEqual(state.indices, initialPortraitState.indices);
});

test("loading and animation preserve the old frame until a matching completion", () => {
  let state = initialPortraitState;
  assert.equal(portraitReducer(state, { type: "advance" }), state);
  assert.equal(portraitReducer(state, { type: "loaded", id: "stale-request" }), state);
  const next = nextPortrait(state)!;
  state = portraitReducer(state, { type: "loaded", id: next.id });
  state = portraitReducer(state, { type: "advance" });
  assert.deepEqual(state.indices, initialPortraitState.indices);
  assert.equal(portraitReducer(state, { type: "advance" }), state);
  assert.equal(portraitReducer(state, { type: "complete", id: "stale-transition" }), state);
  state = portraitReducer(state, { type: "complete", id: next.id });
  assert.equal(state.indices[next.slot], next.index);
  assert.equal(state.incoming, null);
});

test("failed replacements are skipped; an exhausted slot cannot stall the gallery", () => {
  let state = initialPortraitState;
  const first = nextPortrait(state)!;
  state = portraitReducer(state, { type: "failed", id: first.id });
  const second = nextPortrait(state)!;
  assert.equal(second.slot, first.slot);
  assert.notEqual(second.id, first.id);
  state = portraitReducer(state, { type: "failed", id: second.id });
  assert.equal(nextPortrait(state)?.slot, 2);
  assert.deepEqual(state.indices, initialPortraitState.indices);
  assert.equal(portraitReducer(state, { type: "loaded", id: first.id }), state);
  state = advanceLoaded(state);
  assert.equal(nextPortrait(state)?.slot, 0);
});

test("if every replacement fails, keep the initial trio and stop advancing", () => {
  let state = initialPortraitState;
  for (let i = 0; i < 6; i++) {
    state = portraitReducer(state, { type: "failed", id: nextPortrait(state)!.id });
  }
  assert.equal(nextPortrait(state), null);
  assert.deepEqual(state.indices, initialPortraitState.indices);
  assert.equal(portraitReducer(state, { type: "advance" }), state);
});
