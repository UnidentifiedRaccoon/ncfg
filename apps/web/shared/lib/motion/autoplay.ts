interface Scheduler {
  now: () => number;
  schedule: (callback: () => void, delay: number) => () => void;
}

const browserScheduler: Scheduler = {
  now: () => performance.now(),
  schedule: (callback, delay) => {
    const id = setTimeout(callback, delay);
    return () => clearTimeout(id);
  },
};

// Logical time is independent of the rendered progress animation.
export function createAutoplayTimer(duration: number, onComplete: () => void, scheduler = browserScheduler) {
  let elapsed = 0;
  let started: number | null = null;
  let cancel: (() => void) | undefined;
  const pause = () => {
    if (started !== null) elapsed = Math.min(duration, elapsed + scheduler.now() - started);
    started = null;
    cancel?.();
    cancel = undefined;
  };
  return {
    pause,
    remaining: () => Math.max(0, duration - elapsed),
    reset: () => { pause(); elapsed = 0; },
    resume: () => {
      if (started !== null || elapsed >= duration) return;
      started = scheduler.now();
      cancel = scheduler.schedule(() => {
        elapsed = duration;
        started = null;
        cancel = undefined;
        onComplete();
      }, duration - elapsed);
    },
  };
}
