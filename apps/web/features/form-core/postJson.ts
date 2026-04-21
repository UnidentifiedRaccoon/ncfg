export async function postJsonOrThrow<TResponse = unknown>(
  url: string,
  body: unknown,
  fallbackMessage = "Произошла ошибка"
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as TResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" && data.error.trim().length > 0
        ? data.error
        : fallbackMessage
    );
  }

  return data;
}
