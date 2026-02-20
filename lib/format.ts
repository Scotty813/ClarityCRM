export function formatRelativeTime(date: string | null): string {
  if (!date) return "Never";

  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  const diffMo = Math.floor(diffDay / 30);
  return `${diffMo}mo ago`;
}

export function isStale(date: string | null, days = 14): boolean {
  if (!date) return true;
  const diffMs = Date.now() - new Date(date).getTime();
  return diffMs > days * 24 * 60 * 60 * 1000;
}

export function formatCurrency(value: number | null): string {
  if (value === null) return "\u2014";
  return `$${value.toLocaleString()}`;
}
