import {
  CartesianGrid,
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

export default function OccupancyTrendChart({
  data,
}: Props) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="dark-chart">
      <h3 className="dark-chart-title">
        Occupancy Trend
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
              domain={[0, 100]}
              stroke="#547087"
              tick={{
                fill: "#7692a8",
                fontSize: 10,
              }}
              tickFormatter={(value) =>
                `${value}%`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                "Occupancy",
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

            <Line
              type="monotone"
              dataKey="occupancyPercent"
              name="Occupancy"
              stroke="#1d8df2"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#071b2a",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}