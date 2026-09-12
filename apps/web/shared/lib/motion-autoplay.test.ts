import assert from "node:assert/strict";
import { test } from "node:test";
import { createAutoplayTimer } from "./motion/autoplay";

function setup() {
  let now = 0;
  let count = 0;
  const tasks = new Map<number, { at: number; run: () => void }>();
  let id = 0;
  const clock = createAutoplayTimer(5000, () => count++, {
    now: () => now,
    schedule: (run, delay) => {
      const key = ++id;
      tasks.set(key, { at: now + delay, run });
      return () => { tasks.delete(key); };
    },
  });
  const advance = (ms: number) => {
    now += ms;
    for (const [key, task] of tasks) if (task.at <= now) { tasks.delete(key); task.run(); }
  };
  return { clock, advance, count: () => count, pending: () => tasks.size };
}

test("autoplay pauses without advancing offscreen and resumes the remaining time", () => {
  const run = setup();
  run.clock.resume();
  run.advance(2000);
  run.clock.pause();
  assert.equal(run.clock.remaining(), 3000);
  assert.equal(run.pending(), 0);
  run.advance(60000);
  assert.equal(run.count(), 0);
  run.clock.resume();
  run.advance(2999);
  assert.equal(run.count(), 0);
  run.advance(1);
  assert.equal(run.count(), 1);
  run.clock.resume();
  run.advance(10000);
  assert.equal(run.count(), 1);
});

test("manual category changes reset logical progress and repeated resume never duplicates timers", () => {
  const run = setup();
  run.clock.resume();
  run.clock.resume();
  assert.equal(run.pending(), 1);
  run.advance(4900);
  run.clock.reset();
  assert.equal(run.pending(), 0);
  assert.equal(run.clock.remaining(), 5000);
  run.clock.resume();
  run.advance(100);
  assert.equal(run.count(), 0);
  run.clock.pause();
  assert.equal(run.pending(), 0);
});
