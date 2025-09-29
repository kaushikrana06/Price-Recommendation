// src/api/client.ts
// Base URL: from Vite env or default to /api (normalized without trailing slash)
const RAW_API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// Small helpers
function joinPath(path: string) {
  // ensure we always hit `${API_BASE}/${path...}`
  return path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function toISO(d: Date | string): string {
  return typeof d === "string" ? d : d.toISOString().slice(0, 10);
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = joinPath(path);
  const res = await fetch(url, {
    cache: init?.cache ?? "no-store", // avoid any browser caching for live data
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  }
  // If the endpoint returns 204, this will throw—add guards if you ever use 204s.
  return res.json() as Promise<T>;
}

// ===== Types =====
export type Listing = {
  id: string;
  name: string;
  city: string;
  rooms: number | null;
};

export type Recommendation = {
  dt: string; // "YYYY-MM-DD"
  rec_price: number;
  conf_low: number;
  conf_high: number;
  reason: string;
};

// ===== API =====
export const api = {
  getListings: (init?: RequestInit) => http<Listing[]>("/listings/", init),

  getListing: (id: string, init?: RequestInit) =>
    http<Listing>(`/listings/${id}/`, init),

  // Accepts ISO strings; pass { signal } via init when you want to cancel
  getRecommendations: (
    id: string,
    fromISO: string,
    toISO: string,
    init?: RequestInit
  ) =>
    http<Recommendation[]>(
      `/listings/${id}/recommendations/${qs({ from: fromISO, to: toISO })}`,
      init
    ),

  postQuote: (payload: unknown, init?: RequestInit) =>
    http<{ message: string }>(
      "/llm/quote/",
      {
        method: "POST",
        body: JSON.stringify(payload),
        ...(init || {}),
      }
    ),
};

// Convenience helper that accepts Date OR string and optional AbortSignal.
// Usage in UI: getListingRecommendations(listingId, fromDate, toDate, { signal })
export function getListingRecommendations(
  listingId: string,
  from: Date | string,
  to: Date | string,
  init?: RequestInit
) {
  return api.getRecommendations(listingId, toISO(from), toISO(to), init);
}
