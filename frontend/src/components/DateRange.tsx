// src/components/DateRange.tsx
import * as React from "react";

export type Range = { from: Date; to: Date };

type Props = {
  value?: Range;
  onChange: (v: Range) => void;
  /** If provided, the "to" calendar cannot select before this date.
   *  If omitted, we enforce "from + 1 day". */
  minToDate?: Date;
};

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromISO(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d: Date, n: number) {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t;
}

export default function DateRange({ value, onChange, minToDate }: Props) {
  const from = value?.from ?? new Date();
  const to = value?.to ?? addDays(from, 13);

  // "to" cannot be earlier than (minToDate ?? from+1)
  const computedMinTo = React.useMemo(
    () => (minToDate ? minToDate : addDays(from, 1)),
    [from, minToDate]
  );

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = fromISO(e.target.value);
    const minimumTo = addDays(newFrom, 1);
    const coercedTo = to < minimumTo ? minimumTo : to;
    onChange({ from: newFrom, to: coercedTo });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedTo = fromISO(e.target.value);
    const coercedTo = pickedTo < computedMinTo ? computedMinTo : pickedTo;
    onChange({ from, to: coercedTo });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        className="px-3 py-2 rounded-xl border shadow-sm text-sm"
        value={toISO(from)}
        onChange={handleFromChange}
      />
      <span className="text-gray-500 text-sm">to</span>
      <input
        type="date"
        className="px-3 py-2 rounded-xl border shadow-sm text-sm"
        value={toISO(to)}
        min={toISO(computedMinTo)}
        onChange={handleToChange}
      />
    </div>
  );
}
