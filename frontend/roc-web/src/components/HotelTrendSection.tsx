import { useEffect, useState } from "react";

import type { HotelTrendResponse } from "../types/hotel";

import OccupancyTrendChart from "./OccupancyTrendChart";
import RevenueTrendChart from "./RevenueTrendChart";
import RoomPerformanceChart from "./RoomPerformanceChart";

interface Props {
  selectedDate: string;
}

type RangeDays = 7 | 14 | 30;

const MAX_RANGE_DAYS = 365;
const DEMO_FROM = "2026-01-01";
const DEMO_TO = "2026-10-31";

export default function HotelTrendSection({ selectedDate: _selectedDate }: Props) {
  const [range, setRange] = useState<RangeDays | null>(null);
  const [dateFrom, setDateFrom] = useState(DEMO_FROM);
  const [dateTo, setDateTo] = useState(DEMO_TO);
  const [data, setData] = useState<HotelTrendResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setData(generateDemoTrend(dateFrom, dateTo));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreen]);

  function selectPreset(days: RangeDays) {
    setRange(days);
    setDateTo(DEMO_TO);
    setDateFrom(subtractDays(DEMO_TO, days - 1));
    setError(null);
  }

  function changeFrom(value: string) {
    const validationError = validateDateRange(value, dateTo);
    setRange(null);
    setDateFrom(value);
    setError(validationError);
  }

  function changeTo(value: string) {
    const validationError = validateDateRange(dateFrom, value);
    setRange(null);
    setDateTo(value);
    setError(validationError);
  }

  return (
    <section
      className={`hotel-trend-section ${fullscreen ? "hotel-trend-fullscreen" : ""}`}
      style={fullscreen ? {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        padding: 18,
        background: "#071827",
      } : undefined}
    >
      <div className="hotel-trend-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2>Hotel Performance</h2>
            <span style={{
              padding: "3px 8px",
              borderRadius: 999,
              background: "#8a5a00",
              color: "#ffd36a",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".04em",
            }}>
              DEMO DATA
            </span>
          </div>
          <span>Dữ liệu mô phỏng phục vụ trình diễn · 01/01/2026 - 31/10/2026</span>
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
                min={DEMO_FROM}
                max={dateTo || DEMO_TO}
                onChange={(e) => changeFrom(e.target.value)}
                style={dateInputStyle}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ margin: 0, fontSize: 8 }}>Đến ngày</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={minDate(DEMO_TO, addDays(dateFrom, MAX_RANGE_DAYS - 1))}
                onChange={(e) => changeTo(e.target.value)}
                style={dateInputStyle}
              />
            </label>
          </div>

          <div className="trend-range-buttons">
            <RangeButton active={range === 7} onClick={() => selectPreset(7)}>7D</RangeButton>
            <RangeButton active={range === 14} onClick={() => selectPreset(14)}>14D</RangeButton>
            <RangeButton active={range === 30} onClick={() => selectPreset(30)}>30D</RangeButton>
          </div>

          <button
            type="button"
            className="trend-range-button"
            onClick={() => setFullscreen((value) => !value)}
            title={fullscreen ? "Thoát toàn màn hình (Esc)" : "Xem toàn màn hình"}
            aria-label={fullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
            style={{ width: 34, padding: 0, fontSize: 17, lineHeight: 1 }}
          >
            {fullscreen ? "×" : "⛶"}
          </button>
        </div>
      </div>

      {error && <div className="trend-error">{error}</div>}

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

const dateInputStyle = {
  width: 122,
  height: 30,
  padding: "0 6px",
  border: "1px solid #214158",
  borderRadius: 6,
  background: "#102438",
  color: "#d9e5ee",
  colorScheme: "dark",
  fontSize: 10,
} as const;

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

function generateDemoTrend(from: string, to: string): HotelTrendResponse[] {
  const validationError = validateDateRange(from, to);
  if (validationError) return [];

  const result: HotelTrendResponse[] = [];
  const start = parseDate(from);
  const end = parseDate(to);
  const totalRooms = 84;
  let index = 0;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const weekendBoost = dayOfWeek === 5 || dayOfWeek === 6 ? 12 : dayOfWeek === 0 ? 7 : 0;
    const seasonBoost = month >= 5 && month <= 8 ? 10 : month >= 9 ? 6 : 2;
    const wave = 8 * Math.sin(index / 8.5) + 5 * Math.sin(index / 22);
    const occupancyPercent = clamp(58 + seasonBoost + weekendBoost + wave, 48, 94);
    const occupiedRooms = Math.round(totalRooms * occupancyPercent / 100);

    const adr = Math.round(
      1250000
      + seasonBoost * 18000
      + weekendBoost * 12000
      + 90000 * Math.sin(index / 17)
    );
    const revPar = Math.round(adr * occupancyPercent / 100);
    const roomNetRevenue = Math.round(occupiedRooms * adr);
    const ancillaryFactor = 1.48 + 0.08 * Math.sin(index / 13);
    const totalNetRevenue = Math.round(roomNetRevenue * ancillaryFactor);

    result.push({
      businessDate: formatDate(date),
      occupiedRooms,
      occupancyPercent: Number(occupancyPercent.toFixed(1)),
      roomNetRevenue,
      totalNetRevenue,
      adr,
      revPar,
    });
    index += 1;
  }

  return result;
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

function minDate(first: string, second?: string) {
  if (!second) return first;
  return first < second ? first : second;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
