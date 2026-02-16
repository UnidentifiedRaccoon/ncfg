export type FormStatus = "idle" | "loading" | "success" | "error";

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function readErrorMessageFromResponse(
  response: Response
): Promise<string | null> {
  try {
    const data: unknown = await response.json();
    if (!isRecord(data)) return null;

    const error = data.error;
    if (typeof error === "string" && error.trim()) return error;

    const message = data.message;
    if (typeof message === "string" && message.trim()) return message;
  } catch {
    // ignore parse errors
  }

  return null;
}

export function toErrorMessage(error: unknown, fallback = "Произошла ошибка") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

