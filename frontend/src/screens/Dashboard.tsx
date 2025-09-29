// src/screens/Dashboard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { api, type Listing } from "../api/client";
import AppFooter from "../components/AppFooter";

/* ---------------- helpers ---------------- */
function median(nums: number[]) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/* ---------------- icons ---------------- */
function CityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 20h16M6 20V8h6v12M12 20V4h6v16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 11h1M8.5 14h1M8.5 17h1M14.5 7h1M14.5 10h1M14.5 13h1M14.5 16h1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3l8 4v5c0 4.97-3.05 8.88-8 10-4.95-1.12-8-5.03-8-10V7l8-4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 9h1M11 9h1M14 9h1M17 9h1M8 12h1M11 12h1M14 12h1M17 12h1M8 15h1M11 15h1M14 15h1M17 15h1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBBF24" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="url(#g)" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.5" stroke="#FED7AA" strokeWidth="1" opacity=".9" />
      <path d="M10 9.5h5M10 12h5M12 8v8" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 10.5c.8-.7 1.7-1 2.7-1" stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- component ---------------- */
export default function Dashboard() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  // controls the staggered reveal of listing cards
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getListings();
        setListings(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load listings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cityCount = React.useMemo(
    () => new Set(listings.map((l) => l.city)).size,
    [listings]
  );
  const roomsMedian = React.useMemo(
    () => median(listings.map((l) => l.rooms ?? 0)),
    [listings]
  );
  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return listings;
    return listings.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.city.toLowerCase().includes(term)
    );
  }, [q, listings]);

  // Staggered fade-in: reveal one card every 200ms whenever the filtered set changes
  React.useEffect(() => {
    if (loading || error) return;
    setVisibleCount(0);
    if (filtered.length === 0) return;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= filtered.length) clearInterval(iv);
    }, 200);
    return () => clearInterval(iv);
  }, [filtered, loading, error]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* page container for left/right spacing */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-10">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/60 shadow-sm">
          <div className="absolute inset-0 -z-10 animate-pan-slow bg-[radial-gradient(1200px_600px_at_10%_-10%,#dbeafe_20%,transparent_40%),radial-gradient(1200px_600px_at_110%_110%,#fef3c7_20%,transparent_40%),linear-gradient(90deg,#f0f9ff,white,#fefce8)] opacity-60" />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 fade-up">
                  <CoinIcon className="h-7 w-7 animate-bob drop-shadow-sm" />
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    Turn market signals into{" "}
                    <span className="text-gradient">smarter nightly rates</span>
                  </h1>
                </div>
                <p className="mt-3 text-sm md:text-base text-gray-600 fade-up [animation-delay:.08s]">
                  Pricing&nbsp;Intel ingests market samples, occupancy and event
                  signals to generate recommendations with confidence bands —
                  live, on demand.
                </p>
                <div className="mt-4 flex items-center gap-3 fade-up [animation-delay:.14s]">
                  <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-700 bg-white/70 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    API healthy
                  </span>
                  <span className="text-xs text-gray-500">Last sync just now</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 min-w-[260px]">
                <div className="group rounded-2xl border bg-white/80 p-4 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                  <BoltIcon className="h-5 w-5 text-blue-600 group-hover:scale-110 transition" />
                  <div className="mt-2 text-2xl font-semibold">{listings.length}</div>
                  <div className="text-xs text-gray-500">Total listings</div>
                </div>
                <div className="group rounded-2xl border bg-white/80 p-4 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                  <CityIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition" />
                  <div className="mt-2 text-2xl font-semibold">{cityCount}</div>
                  <div className="text-xs text-gray-500">Cities</div>
                </div>
                <div className="group rounded-2xl border bg-white/80 p-4 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                  <ShieldIcon className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition" />
                  <div className="mt-2 text-2xl font-semibold">{roomsMedian}</div>
                  <div className="text-xs text-gray-500">Rooms (median)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-6">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or city…"
              className="w-full rounded-2xl border bg-white/70 px-4 py-2.5 pl-10 shadow-sm outline-none ring-0 focus:border-blue-400"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* LISTINGS (staggered reveal) */}
        <div className="mt-6 grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-full rounded-2xl border bg-white/70 p-6 text-sm text-gray-600 shadow-sm">
              Loading listings…
            </div>
          )}
          {error && (
            <div className="col-span-full rounded-2xl border bg-red-50 p-6 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border bg-white/70 p-6 text-sm text-gray-600 shadow-sm">
              No listings found for “{q}”.
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((l, i) => {
              const show = i < visibleCount; // reveal gate
              return (
                <Link
                  key={l.id}
                  to={`/listings/${l.id}`}
                  className={[
                    "group overflow-hidden rounded-2xl border bg-white/80 p-5 shadow-sm transition-all duration-500 ease-out",
                    show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                    "hover:-translate-y-0.5 hover:shadow-md",
                  ].join(" ")}
                  // a tiny extra delay per card makes it feel smoother while scrolling
                  style={{ transitionDelay: `${Math.min(i, 6) * 20}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{l.name}</div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {l.city} · {l.rooms ?? 0} room(s)
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Click to view recommendations and trigger live prediction
                      </div>
                    </div>

                    <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 opacity-95 ring-1 ring-inset ring-white/50 shadow-inner">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BuildingIcon className="h-5 w-5 text-white/95 drop-shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center text-xs text-blue-600">
                      View details
                      <svg className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                        <path d="M7 12h10M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-[10px] text-gray-400">Live prediction ready</span>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
