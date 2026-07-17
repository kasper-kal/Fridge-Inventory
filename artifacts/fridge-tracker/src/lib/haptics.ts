export function haptic(pattern: number | number[] = 10) {
  try { navigator.vibrate?.(pattern); } catch {}
}
