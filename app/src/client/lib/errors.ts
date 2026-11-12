// Plain-language error text for the operator (UX review, 2026-11-11: a raw validation
// error, "too_big … expected string to have <=12000 characters", reached the screen).
// Messages the server wrote for people pass through; machine output never does.

/** True when the message is machine output (JSON, a validation dump or a stack), not a sentence for a person. */
function looksMachineMade(message: string): boolean {
  const m = message.trim();
  return /^[[{]/.test(m) || /"code"\s*:/.test(m) || /\bat \S+ \(/.test(m) || /^(TypeError|ReferenceError|SyntaxError)\b/.test(m);
}

function codeOf(err: unknown): string | undefined {
  return typeof err === 'object' && err && 'data' in err ? (err as { data?: { code?: string } }).data?.code : undefined;
}

/**
 * The error as a sentence that says what to do next. `fallback` is used when the
 * real message isn't fit to show; it should tell the operator how to get out.
 */
export function friendlyError(err: unknown, fallback: string): string {
  const code = codeOf(err);
  if (code === 'TOO_MANY_REQUESTS') return 'Gemini is busy right now. Wait a moment, then try again.';
  if (code === 'BAD_REQUEST' || code === 'PARSE_ERROR' || code === 'INTERNAL_SERVER_ERROR') return fallback;
  const message = err instanceof Error ? err.message : String(err ?? '');
  if (!message || looksMachineMade(message)) return fallback;
  if (/failed to fetch|networkerror|load failed/i.test(message)) return 'The connection dropped. Check your internet, then try again.';
  return message;
}
