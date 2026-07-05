/** Parse a bullet textarea without dropping blank lines (so Enter works while editing). */
export function bulletsFromTextareaValue(value: string): string[] {
  return value.split('\n').map((line) => line.trimEnd());
}

/** Drop empty lines for public portfolio display and list length checks. */
export function visibleBullets(bullets: string[] | undefined | null): string[] {
  if (!bullets?.length) return [];
  return bullets.filter((line) => line.trim().length > 0);
}

export function hasVisibleBullets(bullets: string[] | undefined | null): boolean {
  return visibleBullets(bullets).length > 0;
}
