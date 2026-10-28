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
const DEFAULT_RANGE_DAYS: RangeDays = 30;

export default function HotelTrendSection({ selectedDate: _selectedDate }: Props) {
  const [range, setRange] = useState<RangeDays | null>(DEFAULT_RANGE_DAYS);
  const [dateFrom, setDateFrom] = useState(subtractDays(DEMO_TO, DEFAULT_RANGE_DAYS - 1));
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
  let previousOccupancy = seededRange(dateSeed(start) - 1, 20, 88);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const seed = dateSeed(date);
    const dayOfWeek = date.getDay();

    let occupancyPercent: number;
    if (dayOfWeek === 6) {
      occupancyPercent = 100;
    } else {
      const randomTarget = seededRange(seed, 20, 96);
      const momentum = seededRange(seed + 17, -18, 18);
      occupancyPercent = clamp(
        previousOccupancy * 0.42 + randomTarget * 0.58 + momentum,
        20,
        96
      );
    }
    previousOccupancy = occupancyPercent;

    const occupiedRooms = dayOfWeek === 6
      ? totalRooms
      : Math.round(totalRooms * occupancyPercent / 100);

    const demandLift = occupancyPercent / 100;
    const adrNoise = seededRange(seed + 31, -110000, 140000);
    const adr = Math.round(clamp(
      1080000 + demandLift * 520000 + adrNoise + (dayOfWeek === 6 ? 140000 : 0),
      980000,
      1850000
    ));
    const revPar = Math.round(adr * occupancyPercent / 100);
    const roomNetRevenue = Math.round(occupiedRooms * adr);

    const ancillaryFactor = clamp(
      1.30 + demandLift * 0.30 + seededRange(seed + 53, -0.08, 0.12),
      1.24,
      1.78
    );
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
  }

  return result;
}

function dateSeed(date: Date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function seededRange(seed: number, min: number, max: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  const normalized = value - Math.floor(value);
  return min + normalized * (max - min);
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
