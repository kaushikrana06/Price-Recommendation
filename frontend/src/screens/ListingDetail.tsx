// src/screens/ListingDetail.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { api, type Listing, type Recommendation } from "../api/client";
import PriceChart from "../components/PriceChart";
import BlockingLoader from "../components/BlockingLoader";
import DateRange from "../components/DateRange";

// ---- date helpers -----------------------------------------------------------
function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function todayISO(): string {
  return dateToISO(new Date());
}
function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}
function addDaysISO(iso: string, days: number): string {
  return dateToISO(addDays(isoToDate(iso), days));
}

// -----------------------------------------------------------------------------

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = React.useState<Listing | null>(null);

  // Data currently shown on the chart (committed range + results)
  const [recs, setRecs] = React.useState<Recommendation[]>([]);
  const [committedFrom, setCommittedFrom] = React.useState(addDaysISO(todayISO(), 0));
  const [committedTo, setCommittedTo] = React.useState(addDaysISO(todayISO(), 13));

  // Date pickers (what the user is editing). Chart will NOT update until button click.
  const [pickerFrom, setPickerFrom] = React.useState<Date>(isoToDate(committedFrom));
  const [pickerTo, setPickerTo] = React.useState<Date>(isoToDate(committedTo));

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Keep a single abort controller for in-flight API
  const abortRef = React.useRef<AbortController | null>(null);

  // Load listing once
  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const li = await api.getListing(id);
        setListing(li);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load listing");
      }
    })();
  }, [id]);

  // Core loader for recommendations (used on first render and button click)
  const loadForRange = React.useCallback(
    async (fromISO: string, toISO: string) => {
      if (!id) return;
      // cancel any in-flight
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const rs = await api.getRecommendations(id, fromISO, toISO, {
          signal: controller.signal,
        });
        // Only commit if this request wasn't aborted
        if (!controller.signal.aborted) {
          setRecs(rs);
          setCommittedFrom(fromISO);
          setCommittedTo(toISO);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message ?? "Failed to load recommendations");
      } finally {
        if (!abortRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  // Initial load for default range
  React.useEffect(() => {
    loadForRange(committedFrom, committedTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // run once per listing

  // When From changes in the picker, enforce that To >= From + 1 day
  React.useEffect(() => {
    const minTo = addDays(pickerFrom, 1);
    if (pickerTo < minTo) {
      setPickerTo(minTo);
    }
  }, [pickerFrom, pickerTo]);

  const handleGetLive = React.useCallback(() => {
    loadForRange(dateToISO(pickerFrom), dateToISO(pickerTo));
  }, [pickerFrom, pickerTo, loadForRange]);

  return (
    <div className="p-6 space-y-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">← Back</Link>

      {listing && (
        <div>
          <h1 className="text-2xl font-bold">{listing.name}</h1>
          <p className="text-sm text-gray-500">
            {listing.city} • {listing.rooms ?? 0} room(s)
          </p>
        </div>
      )}

      {/* Date range controls */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRange
          value={{ from: pickerFrom, to: pickerTo }}
          // This prop exists in the updated DateRange.tsx you pasted earlier:
          // it ensures the "to" calendar can't select before (from + 1)
          minToDate={addDays(pickerFrom, 1)}
          onChange={(v: { from: Date; to: Date }) => {
            if (v?.from) setPickerFrom(v.from);
            if (v?.to) setPickerTo(v.to);
          }}
        />
        <button
          onClick={handleGetLive}
          className="px-4 py-2 rounded-xl shadow text-sm border hover:bg-gray-50"
          disabled={loading}
          title="Fetch fresh recommendations for the selected dates"
        >
          {loading ? "Loading…" : "Get live recommendation"}
        </button>
      </div>

      {/* Full-page overlay while fetching */}
      {loading && <BlockingLoader text="Loading recommendations..." />}

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && !error && (
        <PriceChart
          title="Recommended Price (with confidence band)"
          data={recs}
          from={committedFrom}
          to={committedTo}
        />
      )}

      {!loading && !error && recs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const avg = recs.reduce((s, r) => s + r.rec_price, 0) / recs.length;
            const min = Math.min(...recs.map((r) => r.rec_price));
            const max = Math.max(...recs.map((r) => r.rec_price));
            return (
              <>
                <div className="p-4 rounded-2xl shadow">
                  <div className="text-xs text-gray-500">Avg Price</div>
                  <div className="text-lg font-semibold">{avg.toFixed(0)}</div>
                </div>
                <div className="p-4 rounded-2xl shadow">
                  <div className="text-xs text-gray-500">Min</div>
                  <div className="text-lg font-semibold">{min.toFixed(0)}</div>
                </div>
                <div className="p-4 rounded-2xl shadow">
                  <div className="text-xs text-gray-500">Max</div>
                  <div className="text-lg font-semibold">{max.toFixed(0)}</div>
                </div>
                <div className="p-4 rounded-2xl shadow">
                  <div className="text-xs text-gray-500">Days</div>
                  <div className="text-lg font-semibold">{recs.length}</div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
