import type {
  RebrickableSet,
  RebrickableMinifig,
  RebrickablePart,
  RebrickableTheme,
  RebrickablePaginatedResponse,
} from './types';

const BASE_URL = 'https://rebrickable.com/api/v3';

let cachedApiKey: string | null = null;

export function setApiKey(key: string) {
  cachedApiKey = key;
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!cachedApiKey) {
    throw new Error('Rebrickable API key not set. Please add your key in Settings.');
  }
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `key ${cachedApiKey}` },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('SET_NOT_FOUND');
    throw new Error(`Rebrickable API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchSet(setNum: string): Promise<RebrickableSet> {
  const normalized = setNum.includes('-') ? setNum : `${setNum}-1`;
  return request<RebrickableSet>(`/lego/sets/${normalized}/`);
}

export async function searchSets(query: string, page = 1): Promise<RebrickablePaginatedResponse<RebrickableSet>> {
  return request<RebrickablePaginatedResponse<RebrickableSet>>('/lego/sets/', {
    search: query,
    page: String(page),
    page_size: '20',
    ordering: '-year',
  });
}

export async function fetchSetMinifigs(setNum: string): Promise<RebrickableMinifig[]> {
  const normalized = setNum.includes('-') ? setNum : `${setNum}-1`;
  const res = await request<RebrickablePaginatedResponse<RebrickableMinifig>>(
    `/lego/sets/${normalized}/minifigs/`,
    { page_size: '100' }
  );
  return res.results;
}

export async function fetchSetParts(setNum: string, page = 1): Promise<RebrickablePaginatedResponse<RebrickablePart>> {
  const normalized = setNum.includes('-') ? setNum : `${setNum}-1`;
  return request<RebrickablePaginatedResponse<RebrickablePart>>(
    `/lego/sets/${normalized}/parts/`,
    { page: String(page), page_size: '100' }
  );
}

export async function fetchThemes(): Promise<RebrickableTheme[]> {
  const res = await request<RebrickablePaginatedResponse<RebrickableTheme>>(
    '/lego/themes/',
    { page_size: '1000' }
  );
  return res.results;
}

export async function lookupBarcode(barcode: string): Promise<RebrickableSet | null> {
  // Try as-is first (some barcodes contain the set number)
  try {
    return await fetchSet(barcode);
  } catch {}

  // Try searching by the barcode value
  try {
    const results = await searchSets(barcode);
    if (results.results.length > 0) return results.results[0];
  } catch {}

  return null;
}
