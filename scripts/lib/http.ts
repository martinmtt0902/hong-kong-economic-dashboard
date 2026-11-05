const DEFAULT_HEADERS = { "User-Agent": "hk-economic-dashboard/0.1", Accept: "*/*" };
const requests = new Map<string, Promise<Uint8Array>>();

export async function fetchText(url: string): Promise<string> {
  return new TextDecoder().decode(await fetchBytes(url));
}

export async function fetchJson<T>(url: string): Promise<T> {
  return JSON.parse(await fetchText(url)) as T;
}

// Share identical source requests across metrics; retry a transient failure once.
export function fetchBytes(url: string): Promise<Uint8Array> {
  const existing = requests.get(url);
  if (existing) return existing;
  const request = (async () => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const response = await fetch(url, { headers: DEFAULT_HEADERS, signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Request failed for ${url}: ${response.status}`);
        return new Uint8Array(await response.arrayBuffer());
      } catch (error) {
        if (attempt >= 1) throw error;
      }
    }
  })();
  requests.set(url, request);
  request.catch(() => requests.delete(url));
  return request;
}
