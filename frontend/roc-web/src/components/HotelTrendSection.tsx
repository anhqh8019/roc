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

const MAX_RANGE_DAYS = 365;

export default function HotelTrendSection({ selectedDate }: Props) {
  const [range, setRange] = useState<RangeDays | null>(7);
  const [dateFrom, setDateFrom] = useState(() => subtractDays(selectedDate, 6));
  const [dateTo, setDateTo] = useState(selectedDate);
  const [data, setData] = useState<HotelTrendResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (range !== null) {
      setDateFrom(subtractDays(selectedDate, range - 1));
      setDateTo(selectedDate);
    }
  }, [selectedDate, range]);

  useEffect(() => {
    void loadTrend(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  async function loadTrend(from: string, to: string) {
    const validationError = validateDateRange(from, to);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getHotelTrend(from, to);
      setData(result);
    } catch (error) {
      console.error("Load trend error:", error);
      setError("Không tải được dữ liệu performance");
    } finally {
      setLoading(false);
    }
  }

  function selectPreset(days: RangeDays) {
    setRange(days);
    setDateFrom(subtractDays(selectedDate, days - 1));
    setDateTo(selectedDate);
  }

  function changeFrom(value: string) {
    setRange(null);
    setDateFrom(value);
  }

  function changeTo(value: string) {
    setRange(null);
    setDateTo(value);
  }

  return (
    <section className="hotel-trend-section">
      <div className="hotel-trend-header">
        <div>
          <h2>Hotel Performance</h2>
          <span>Historical performance trend</span>
        </div>

        <div
          className="trend-range-controls"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div
            className="trend-date-range"
            style={{ display: "flex", alignItems: "flex-end", gap: 6 }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ margin: 0, fontSize: 8 }}>Từ ngày</span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || selectedDate}
                onChange={(e) => changeFrom(e.target.value)}
                style={{
                  width: 122,
                  height: 30,
                  padding: "0 6px",
                  border: "1px solid #214158",
                  borderRadius: 6,
                  background: "#102438",
                  color: "#d9e5ee",
                  colorScheme: "dark",
                  fontSize: 10,
                }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ margin: 0, fontSize: 8 }}>Đến ngày</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={addDays(dateFrom, MAX_RANGE_DAYS - 1)}
                onChange={(e) => changeTo(e.target.value)}
                style={{
                  width: 122,
                  height: 30,
                  padding: "0 6px",
                  border: "1px solid #214158",
                  borderRadius: 6,
                  background: "#102438",
                  color: "#d9e5ee",
                  colorScheme: "dark",
                  fontSize: 10,
                }}
              />
            </label>
          </div>

          <div className="trend-range-buttons">
            <RangeButton active={range === 7} onClick={() => selectPreset(7)}>7D</RangeButton>
            <RangeButton active={range === 14} onClick={() => selectPreset(14)}>14D</RangeButton>
            <RangeButton active={range === 30} onClick={() => selectPreset(30)}>30D</RangeButton>
          </div>
        </div>
      </div>

      {error && <div className="trend-error">{error}</div>}

      {loading && data.length === 0 && <div className="trend-loading">Loading...</div>}

      {data.length > 0 && (
        <>
          <div className="trend-chart-grid">
            <OccupancyTrendChart data={data} />
            <RevenueTrendChart data={data} />
          </div>
          <RoomPerformanceChart data={data} />
        </>
      )}
    </section>
  );
}

function RangeButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`trend-range-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function validateDateRange(from: string, to: string) {
  if (!from || !to) return "Vui lòng chọn đầy đủ Từ ngày và Đến ngày.";

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (toDate < fromDate) return "Đến ngày phải lớn hơn hoặc bằng Từ ngày.";

  const days = Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  if (days > MAX_RANGE_DAYS) return "Khoảng thời gian tối đa là 1 năm (365 ngày).";

  return null;
}

function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractDays(dateString: string, days: number) {
  const date = parseDate(dateString);
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

function addDays(dateString: string, days: number) {
  if (!dateString) return undefined;
  const date = parseDate(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}
