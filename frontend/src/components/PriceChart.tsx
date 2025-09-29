// src/components/PriceChart.tsx
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Recommendation } from "../api/client";

// Local date parser: "YYYY-MM-DD" -> local Date (not UTC)
function parseLocalDate(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function fmtDateShort(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type PriceChartProps = {
  title?: string;
  data: Recommendation[];
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
};

export default function PriceChart({ title, data, from, to }: PriceChartProps) {
  const x0 = parseLocalDate(from).getTime();
  const x1 = parseLocalDate(to).getTime();

  // Map to recharts-friendly points
  const points = React.useMemo(
    () =>
      data.map((r) => ({
        ts: parseLocalDate(r.dt).getTime(),
        dateLabel: r.dt,
        rec: r.rec_price,
        low: r.conf_low,
        high: r.conf_high,
      })),
    [data]
  );

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div className="h-[360px] w-full">
        <ResponsiveContainer>
          <AreaChart data={points} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="recFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.35} />
                <stop offset="95%" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopOpacity={0.20} />
                <stop offset="100%" stopOpacity={0.10} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              domain={[x0, x1]}   // <-- lock to full requested range
              tickFormatter={(v) => fmtDateShort(new Date(v))}
              scale="time"
            />
            <YAxis />
            <Tooltip
              formatter={(v: number, name: string) => [v.toFixed(0), name]}
              labelFormatter={(v) => fmtDateShort(new Date(Number(v)))}
            />
            <Legend />

            {/* Confidence band: draw as two areas (high and low) with light fill */}
            <Area
              type="monotone"
              dataKey="high"
              name="Confidence high"
              fill="url(#bandFill)"
              strokeOpacity={0}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="low"
              name="Confidence low"
              fill="url(#bandFill)"
              strokeOpacity={0}
              activeDot={false}
            />

            {/* Recommended price */}
            <Area
              type="monotone"
              dataKey="rec"
              name="Recommended"
              strokeWidth={2}
              fill="url(#recFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
