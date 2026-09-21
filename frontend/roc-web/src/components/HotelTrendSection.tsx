import { useEffect, useState } from "react";

import { getHotelTrend } from "../api/hotelApi";
import type { HotelTrendResponse } from "../types/hotel";

import OccupancyTrendChart from "./OccupancyTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import RoomPerformanceChart from "./RoomPerformanceChart";

interface Props {
  selectedDate: string;
}

type RangeDays = 7 | 14 | 30;

export default function HotelTrendSection({
  selectedDate,
}: Props) {
  const [range, setRange] =
    useState<RangeDays>(7);

  const [data, setData] =
    useState<HotelTrendResponse[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadTrend();
  }, [selectedDate, range]);

  async function loadTrend() {
    try {
      setLoading(true);
      setError(null);

      const from = subtractDays(
        selectedDate,
        range - 1
      );

      const result = await getHotelTrend(
        from,
        selectedDate
      );

      setData(result);
    } catch (error) {
      console.error(
        "Load trend error:",
        error
      );

      setError(
        "Không tải được dữ liệu performance"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hotel-trend-section">
      <div className="hotel-trend-header">
        <div>
          <h2>Hotel Performance</h2>

          <span>
            Historical performance trend
          </span>
        </div>

        <div className="trend-range-buttons">
          <RangeButton
            active={range === 7}
            onClick={() => setRange(7)}
          >
            7D
          </RangeButton>

          <RangeButton
            active={range === 14}
            onClick={() => setRange(14)}
          >
            14D
          </RangeButton>

          <RangeButton
            active={range === 30}
            onClick={() => setRange(30)}
          >
            30D
          </RangeButton>
        </div>
      </div>

      {error && (
        <div className="trend-error">
          {error}
        </div>
      )}

      {loading && data.length === 0 && (
        <div className="trend-loading">
          Loading...
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="trend-chart-grid">
            <OccupancyTrendChart
              data={data}
            />

            <RevenueTrendChart
              data={data}
            />
          </div>

          <RoomPerformanceChart
            data={data}
          />
        </>
      )}
    </section>
  );
}

function RangeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`trend-range-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function subtractDays(
  dateString: string,
  days: number
) {
  const date =
    new Date(`${dateString}T00:00:00`);

  date.setDate(
    date.getDate() - days
  );

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}