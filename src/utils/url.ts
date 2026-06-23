export function readParam(params: URLSearchParams, key: string, fallback = ""): string {
  return params.get(key) ?? fallback;
}

export function writeParams(params: URLSearchParams, updates: Record<string, string | number | null | undefined>): URLSearchParams {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  });
  return next;
}
