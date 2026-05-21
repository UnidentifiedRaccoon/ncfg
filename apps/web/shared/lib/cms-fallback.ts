interface CmsFallbackOptions<T> {
  label: string;
  fallback: T;
  onError?: (message: string) => void;
}

function summarizeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

export async function withCmsFallback<T>(
  load: () => Promise<T>,
  options: CmsFallbackOptions<T>
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    const log = options.onError ?? console.warn;
    log(`[cms-fallback] ${options.label} failed; using fallback. ${summarizeError(error)}`);

    return options.fallback;
  }
}
