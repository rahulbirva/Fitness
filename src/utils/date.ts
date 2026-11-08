/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function todayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD or ISO string into human friendly Indian/global format: "12 Oct 2025"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Calculates calendar days until a target date (e.g. wedding date)
 * Returns 0 if today, negative if in the past, positive if in the future.
 */
export function daysUntil(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const parts = targetDateStr.split('-');
  let target: Date;
  if (parts.length === 3) {
    target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    target = new Date(targetDateStr);
  }
  target.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats seconds into MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
