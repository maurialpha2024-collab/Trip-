// Completed registrations per day over the last 30 days. Colours come from the
// CSS tokens, so the chart follows dark mode without a second palette.

"use client";

import { useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyPoint = {
  date: string;
  count: number;
};

export function WeeklyChart({ points }: { points: DailyPoint[] }) {
  const t = useTranslations("dashboard");

  return (
    <section className="rounded-card border-line bg-surface space-y-3 border p-4">
      <h2 className="text-heading text-ink text-start">{t("registrations")}</h2>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis
              dataKey="date"
              stroke="var(--ink-muted)"
              tick={{ fontSize: 11 }}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--ink-muted)"
              tick={{ fontSize: 11 }}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "0.5rem",
                color: "var(--ink)",
              }}
              labelStyle={{ color: "var(--ink-muted)" }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--indigo)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
