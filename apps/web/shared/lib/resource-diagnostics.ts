export type ResourceKind = "css" | "script" | "image" | "font";

export interface ResourceFailure {
  kind: ResourceKind;
  release: string;
}

export function diagnosticsAllowed(href: string, siteOrigin: string, topLevel: boolean): boolean {
  try {
    const url = new URL(href);
    return topLevel && url.origin === new URL(siteOrigin).origin &&
      url.protocol === "https:" && url.hostname !== "localhost" &&
      !/^\/(experiments|storybook|api)(\/|$)/.test(url.pathname);
  } catch {
    return false;
  }
}

/** At most one event per resource kind per document; no URLs or user data. */
export function createResourceReporter(release: string | undefined, send: (failure: ResourceFailure) => boolean) {
  const version = release && /^[a-f0-9]{7,40}$/i.test(release) ? release : "unknown";
  const seen = new Set<ResourceKind>();
  const pending = new Set<ResourceKind>();
  const flush = () => {
    for (const kind of pending) {
      try {
        if (send({ kind, release: version })) pending.delete(kind);
      } catch {
        // Monitoring must never break navigation or a form.
      }
    }
  };
  return {
    record(kind: ResourceKind) {
      if (seen.has(kind)) return;
      seen.add(kind);
      pending.add(kind);
      flush();
    },
    flush,
  };
}
