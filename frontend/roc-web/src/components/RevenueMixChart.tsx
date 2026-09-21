import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { HotelDashboardResponse } from "../types/hotel";

interface Props {
  data: HotelDashboardResponse;
}

const COLORS = [
  "#188df2",
  "#19bf73",
  "#f59e0b",
  "#8b5cf6",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueMixChart({
  data,
}: Props) {
  const chartData = [
    {
      name: "Room",
      value: data.revenue.roomNetRevenue,
    },
    {
      name: "F&B",
      value: data.revenue.foodBeverageRevenue,
    },
    {
      name: "Onsen",
      value: data.revenue.onsenRevenue,
    },
    {
      name: "Other",
      value: data.revenue.otherRevenue,
    },
  ];

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="revenue-mix">
      <div className="revenue-donut-wrapper">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                `${formatMoney(Number(value))} đ`
              }
              contentStyle={{
                background: "#0b1d2b",
                border: "1px solid #21445d",
                borderRadius: 7,
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="revenue-donut-center">
          <span>Tổng</span>

          <strong>
            {formatMoney(total)}
          </strong>

          <small>đ</small>
        </div>
      </div>

      <div className="revenue-legend">
        {chartData.map((item, index) => {
          const percent =
            total > 0
              ? (item.value * 100) / total
              : 0;

          return (
            <div
              key={item.name}
              className="revenue-legend-row"
            >
              <div className="revenue-legend-name">
                <span
                  className="revenue-dot"
                  style={{
                    background: COLORS[index],
                  }}
                />

                <span>{item.name}</span>
              </div>

              <div className="revenue-legend-value">
                <strong>
                  {percent.toFixed(1)}%
                </strong>

                <span>
                  {formatMoney(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}