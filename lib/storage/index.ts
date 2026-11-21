/** Versioned, failure-tolerant localStorage. Nothing here ever leaves the device. */
const PREFIX = "wonderdays:v1:";
const memory = new Map<string, string>();

function ls(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // private mode / blocked storage
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = ls()?.getItem(PREFIX + key) ?? memory.get(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  memory.set(PREFIX + key, raw);
  try {
    ls()?.setItem(PREFIX + key, raw);
  } catch {
    /* quota or blocked: memory copy keeps the session working */
  }
}

export function removeKey(key: string): void {
  memory.delete(PREFIX + key);
  try {
    ls()?.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
