const NBSP = "\u00A0";

export function applyRussianTypographyRules(value: string): string {
  return value
    .replace(
      /(^|[\s«"(\[{—–-])([АаИиКкСсУуОоВв]) (?=[0-9А-ЯЁа-яё])/gu,
      (_, prefix: string, shortWord: string) => `${prefix}${shortWord}${NBSP}`
    )
    .replace(/№ (?=\d)/gu, `№${NBSP}`)
    .replace(/(\d) %/gu, `$1${NBSP}%`);
}
