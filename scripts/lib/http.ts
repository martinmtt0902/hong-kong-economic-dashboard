const DEFAULT_HEADERS = {
  "User-Agent": "hk-economic-dashboard/0.1",
  Accept: "*/*"
};

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.text();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}
