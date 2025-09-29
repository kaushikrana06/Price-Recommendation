// src/screens/Compare.tsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { api, type Listing, type Recommendation } from "../api/client";
import { Link } from "react-router-dom";

type SeriesMap = Record<string, Recommendation[]>;

function dateToISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dateToISO(dt);
}
const todayISO = () => dateToISO(new Date());

const COLORS = ["#2563eb", "#16a34a", "#ef4444", "#9333ea", "#f59e0b"];

export default function Compare() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [series, setSeries] = React.useState<SeriesMap>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const from = todayISO();
  const to = addDaysISO(from, 13);

  // Load available listings (no auto-select)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ls = await api.getListings();
        if (!alive) return;
        setListings(ls);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load listings");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch recommendations for current selection
  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (selectedIds.length === 0) {
        setSeries({});
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const entries: [string, Recommendation[]][] = await Promise.all(
          selectedIds.map(async (id): Promise<[string, Recommendation[]]> => {
            try {
              const recs = await api.getRecommendations(id, from, to);
              return [id, recs];
            } catch {
              return [id, [] as Recommendation[]];
            }
          })
        );
        if (!alive) return;
        const map: SeriesMap = {};
        entries.forEach(([id, recs]) => {
          map[id] = recs;
        });
        setSeries(map);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load data");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedIds, from, to]);

  // Combined rows for overlay chart (union of dates)
  const overlayRows = React.useMemo(() => {
    const dates = new Set<string>();
    selectedIds.forEach((id) => {
      (series[id] ?? []).forEach((r) => dates.add(r.dt));
    });
    const sorted = Array.from(dates).sort();
    const rows = sorted.map((dt) => {
      const row: Record<string, any> = { dt };
      selectedIds.forEach((id) => {
        const rec = (series[id] ?? []).find((r) => r.dt === dt);
        if (rec) row[id] = rec.rec_price;
      });
      return row;
    });
    return rows.filter((row) => selectedIds.some((id) => row[id] != null));
  }, [series, selectedIds]);

  const upToFive = (ids: string[]) => (ids.length > 5 ? ids.slice(0, 5) : ids);

  function addSelected(id: string) {
    if (!id) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      return upToFive([...prev, id]);
    });
  }
  function removeSelected(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  const showEmpty = selectedIds.length === 0;

  // helpers
  const labelFor = (id: string) => {
    const l = listings.find((x) => x.id === id);
    if (!l) return id;
    return `${l.name} — ${l.city}${l.rooms ? ` (${l.rooms} room${l.rooms > 1 ? "s" : ""})` : ""}`;
  };

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compare Listings</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <p className="text-sm text-gray-600">
        Select up to 5 listings to overlay their recommended price curves for the next two weeks.
      </p>

      {/* selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              addSelected(e.target.value);
              e.currentTarget.selectedIndex = 0;
            }}
            className="min-w-[320px] rounded-xl border px-3 py-2 bg-white shadow-sm"
          >
            <option value="" disabled selected>
              Add listing…
            </option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.city} {l.rooms ? `• ${l.rooms} room(s)` : ""}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">(max 5)</span>
        </div>

        {/* selection chips */}
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div
                key={id}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl border bg-white shadow-sm"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{labelFor(id)}</span>
                <button
                  onClick={() => removeSelected(id)}
                  className="text-gray-400 hover:text-gray-600 px-1"
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* overlay card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">
          Overlay (today → next 14 days)
        </h3>

        {showEmpty && (
          <div className="border border-dashed rounded-xl py-12 text-center text-gray-500">
            <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-full bg-blue-50 text-blue-600">
              +
            </div>
            <div className="font-medium">Select listings to compare</div>
            <div className="text-sm">
              Use the dropdown above to add up to 5 listings.
            </div>
          </div>
        )}

        {!showEmpty && error && (
          <div className="text-sm text-red-600 mb-2">{error}</div>
        )}
        {!showEmpty && loading && (
          <div className="text-sm text-gray-500">Loading…</div>
        )}
        {!showEmpty && !loading && overlayRows.length === 0 && (
          <div className="text-sm text-gray-500">
            No data in this window for the current selection.
          </div>
        )}

        {!showEmpty && !loading && overlayRows.length > 0 && (
          <>
            <div className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overlayRows} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" />
                  <YAxis />
                  <Tooltip />
                  {selectedIds.map((id, i) => {
                    const hasData = (series[id] ?? []).length > 0;
                    if (!hasData) return null;
                    return (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={id}
                        stroke={COLORS[i % COLORS.length]}
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legend with human labels */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedIds.map((id, i) => {
                const hasData = (series[id] ?? []).length > 0;
                if (!hasData) return null;
                return (
                  <div
                    key={`legend-${id}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-xl border bg-gray-50"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-700">{labelFor(id)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* individual mini charts */}
      {!showEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedIds.map((id, i) => {
            const recs = series[id] ?? [];
            if (recs.length === 0) return null; // hide if no data
            const color = COLORS[i % COLORS.length];
            const label = labelFor(id);
            return (
              <div key={id} className="rounded-2xl border bg-white p-4 shadow-sm">
                {/* Card header label */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <div className="text-sm font-semibold">{label}</div>
                </div>
                {/* Chart */}
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recs} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dt" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="rec_price"
                        stroke={color}
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false}
                        name="Recommended"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Card footer caption */}
                <div className="mt-2 text-xs text-gray-600">{label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
