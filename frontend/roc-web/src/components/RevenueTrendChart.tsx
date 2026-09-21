import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HotelTrendResponse } from "../types/hotel";

interface Props {
  data: HotelTrendResponse[];
}

function formatCompactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }

  return String(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueTrendChart({
  data,
}: Props) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="dark-chart">
      <h3 className="dark-chart-title">
        Revenue Trend
      </h3>

      <div className="dark-chart-body">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#17384d"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="businessDate"
              stroke="#547087"
              tick={{
                fill: "#7692a8",
                fontSize: 10,
              }}
              tickFormatter={(value: string) =>
                value.substring(5)
              }
            />

            <YAxis
              stroke="#547087"
              tick={{
                fill: "#7692a8",
                fontSize: 10,
              }}
              tickFormatter={formatCompactMoney}
            />

            <Tooltip
              formatter={(value, name) => [
                `${formatMoney(Number(value))} đ`,
                name,
              ]}
              contentStyle={{
                background: "#0b1d2b",
                border: "1px solid #21445d",
                borderRadius: 7,
                color: "#fff",
              }}
              labelStyle={{
                color: "#9fb4c7",
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: 10,
                color: "#91a7ba",
              }}
            />

            <Line
              type="monotone"
              dataKey="roomNetRevenue"
              name="Room"
              stroke="#1d8df2"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="totalNetRevenue"
              name="Total"
              stroke="#19bf73"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}