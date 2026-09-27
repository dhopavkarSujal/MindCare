import {
  useMemo,
} from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatDay(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
    }
  );
}

function formatTooltipDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function MoodChart({
  moods = [],
}) {
  const chartData = useMemo(() => {

    return [...moods]
      .filter(
        (item) =>
          item?.score != null
      )
      .sort(
        (a, b) =>
          new Date(
            a.createdAt ||
            a.created_at
          ) -
          new Date(
            b.createdAt ||
            b.created_at
          )
      )
      .slice(-7)
      .map((item) => ({
        score: Number(item.score),
        date:
          item.createdAt ||
          item.created_at,
        label: formatDay(
          item.createdAt ||
          item.created_at
        ),
      }));

  }, [moods]);

  const average =
    chartData.length > 0
      ? (
          chartData.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) /
          chartData.length
        ).toFixed(1)
      : "0.0";

  if (!chartData.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-[#F8FAFC] text-center">

        <div className="text-3xl">
          📈
        </div>

        <p className="mt-3 text-sm font-medium text-[#172033]">
          No mood data yet
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
          Record a few mood check-ins and your
          trend will appear here.
        </p>

      </div>
    );
  }

  return (
    <div>

      {/* Header stats */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

        <div>
          <p className="text-xs text-slate-400">
            Average mood
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-[#172033]">
              {average}
            </span>

            <span className="text-xs text-slate-400">
              / 5
            </span>
          </div>
        </div>

        <div className="rounded-full bg-[#DFF5F1] px-3 py-1.5 text-xs font-medium text-[#0F766E]">
          Last 7 check-ins
        </div>

      </div>

      {/* Chart */}
      <div className="h-64 w-full">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 5,
              left: -25,
              bottom: 0,
            }}
          >

            <defs>
              <linearGradient
                id="moodGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#0F766E"
                  stopOpacity={0.18}
                />

                <stop
                  offset="100%"
                  stopColor="#0F766E"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
              }}
            />

            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: 10,
              }}
            />

            <Tooltip
              cursor={{
                stroke: "#CBD5E1",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 8px 30px rgba(15,23,42,0.08)",
                fontSize: "12px",
              }}
              formatter={(value) => [
                `${value} / 5`,
                "Mood",
              ]}
              labelFormatter={(
                _,
                payload
              ) => {
                const date =
                  payload?.[0]?.payload
                    ?.date;

                return formatTooltipDate(
                  date
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#0F766E"
              strokeWidth={2.5}
              fill="url(#moodGradient)"
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: "#FFFFFF",
                stroke: "#0F766E",
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                fill: "#FFFFFF",
                stroke: "#0F766E",
              }}
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}