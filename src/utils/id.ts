// Simple UUID-like ID generator (no external dep needed)
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 9);
  return `${timestamp}-${random}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
