export function pickLatestDate(
  values: ReadonlyArray<string | null | undefined>,
  context: string
): string {
  let latestValue: string | null = null;
  let latestTimestamp = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (!value) {
      continue;
    }

    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      throw new Error(`Invalid date in ${context}: ${value}`);
    }

    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
      latestValue = value;
    }
  }

  if (!latestValue) {
    throw new Error(`Missing date in ${context}`);
  }

  return latestValue;
}
